const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Always resolve .env relative to backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: '+05:30', // Default IST
  dateStrings: true
});

// Test connection on boot
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME}) at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
  } catch (err) {
    console.error('[Database] MySQL Connection Failed:', err.message);
  }
})();

module.exports = pool;
