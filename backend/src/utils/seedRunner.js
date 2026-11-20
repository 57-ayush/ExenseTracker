const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runSeed() {
  console.log('--- Starting Database Seed Runner ---');
  try {
    const databaseDir = path.join(__dirname, '../../../database');
    const schemaSql = fs.readFileSync(path.join(databaseDir, 'schema.sql'), 'utf8');
    const viewsSql = fs.readFileSync(path.join(databaseDir, 'views.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(databaseDir, 'seed.sql'), 'utf8');

    // Split SQL by semicolons while handling basic multiline statements
    const executeStatements = async (sqlText, label) => {
      console.log(`Executing ${label}...`);
      const statements = sqlText
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err) {
          // Ignore table drop warnings
          if (!err.message.includes('Unknown table')) {
            console.warn(`[Warning in ${label}]:`, err.message);
          }
        }
      }
    };

    await executeStatements(schemaSql, 'schema.sql');
    await executeStatements(viewsSql, 'views.sql');
    await executeStatements(seedSql, 'seed.sql');

    console.log('✅ Database Schema, Views, and Seed Data successfully populated!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed runner failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
