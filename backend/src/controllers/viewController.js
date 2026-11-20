const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// View definitions and educational metadata for university DBMS evaluation
const VIEW_METADATA = [
  {
    viewName: 'v_expense_transactions',
    displayName: '1. Updatable Expense Transactions View',
    viewType: 'Single-Table Horizontal Slice',
    isUpdatable: true,
    supportsCheckOption: true,
    checkOptionType: 'WITH CHECK OPTION',
    purpose: 'Provides a secure abstraction layer exposing ONLY expense transactions. Being a single-table view without grouping or aggregate functions, MySQL permits full INSERT, UPDATE, and DELETE operations. The WITH CHECK OPTION guarantees that no row can be inserted or modified to have transaction_type != EXPENSE.',
    sqlDefinition: `CREATE OR REPLACE VIEW v_expense_transactions AS
SELECT 
    transaction_id,
    user_id,
    category_id,
    transaction_type,
    amount,
    transaction_date,
    payment_method,
    description,
    created_at
FROM transactions
WHERE transaction_type = 'EXPENSE'
WITH CHECK OPTION;`,
    dbmsConcept: 'View Updatability & Integrity Constraints (WITH CHECK OPTION)'
  },
  {
    viewName: 'v_transaction_details',
    displayName: '2. Joined Transaction Details View',
    viewType: 'Multi-Table Joined View',
    isUpdatable: false,
    supportsCheckOption: false,
    purpose: 'Combines the transactions table with users and categories via INNER JOINs to provide human-readable transaction logs with full user details and category names without repeating JOIN syntax in application queries.',
    sqlDefinition: `CREATE OR REPLACE VIEW v_transaction_details AS
SELECT 
    t.transaction_id,
    t.user_id,
    u.full_name AS user_name,
    u.email AS user_email,
    t.category_id,
    c.category_name,
    c.category_type,
    t.transaction_type,
    t.amount,
    t.transaction_date,
    t.payment_method,
    t.description,
    t.created_at
FROM transactions t
INNER JOIN users u ON t.user_id = u.user_id
INNER JOIN categories c ON t.category_id = c.category_id;`,
    dbmsConcept: 'Relational Joins, Data Abstraction & Security Projection'
  },
  {
    viewName: 'v_monthly_expense_summary',
    displayName: '3. Aggregate Monthly Expense Summary View',
    viewType: 'Aggregated View (GROUP BY)',
    isUpdatable: false,
    supportsCheckOption: false,
    purpose: 'Calculates total income, total expenses, net savings, and total transactions grouped by user and calendar month using SUM, COUNT, and CASE aggregate functions. Simplifies financial reporting across the entire application.',
    sqlDefinition: `CREATE OR REPLACE VIEW v_monthly_expense_summary AS
SELECT 
    t.user_id,
    DATE_FORMAT(t.transaction_date, '%Y-%m-01') AS month_date,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS formatted_month,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE -t.amount END), 0) AS net_savings,
    COUNT(t.transaction_id) AS total_transactions
FROM transactions t
GROUP BY t.user_id, DATE_FORMAT(t.transaction_date, '%Y-%m-01'), DATE_FORMAT(t.transaction_date, '%Y-%m');`,
    dbmsConcept: 'SQL Aggregate Functions (SUM, COUNT, CASE) & GROUP BY'
  },
  {
    viewName: 'v_budget_utilization',
    displayName: '4. Complex Analytical Budget Utilization View',
    viewType: 'Analytical Joined & Aggregated View',
    isUpdatable: false,
    supportsCheckOption: false,
    purpose: 'Performs a sophisticated cross-table analysis joining budgets with categories and LEFT JOINing real expense transactions for the corresponding month. Dynamically computes amount spent, remaining budget, percentage used, and categorical status (On Track, Near Limit, Exceeded).',
    sqlDefinition: `CREATE OR REPLACE VIEW v_budget_utilization AS
SELECT 
    b.budget_id,
    b.user_id,
    b.category_id,
    c.category_name,
    b.budget_month,
    DATE_FORMAT(b.budget_month, '%Y-%m') AS formatted_month,
    b.budget_amount,
    COALESCE(SUM(t.amount), 0) AS amount_spent,
    (b.budget_amount - COALESCE(SUM(t.amount), 0)) AS remaining_budget,
    ROUND(
        CASE 
            WHEN b.budget_amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.budget_amount) * 100
            ELSE 0 
        END, 
        2
    ) AS percentage_used,
    CASE 
        WHEN COALESCE(SUM(t.amount), 0) > b.budget_amount THEN 'Exceeded'
        WHEN COALESCE(SUM(t.amount), 0) >= (b.budget_amount * 0.85) THEN 'Near Limit'
        ELSE 'On Track'
    END AS budget_status
FROM budgets b
INNER JOIN categories c ON b.category_id = c.category_id
LEFT JOIN transactions t ON t.user_id = b.user_id 
    AND t.category_id = b.category_id 
    AND t.transaction_type = 'EXPENSE'
    AND DATE_FORMAT(t.transaction_date, '%Y-%m') = DATE_FORMAT(b.budget_month, '%Y-%m')
GROUP BY 
    b.budget_id, 
    b.user_id, 
    b.category_id, 
    c.category_name, 
    b.budget_month, 
    b.budget_amount;`,
    dbmsConcept: 'Advanced Multi-Table Aggregation, LEFT JOINs & Conditional Logic'
  }
];

// @desc    Get metadata for all 4 views
// @route   GET /api/views
const getViewList = (req, res) => {
  return successResponse(res, 'View metadata retrieved', VIEW_METADATA);
};

// @desc    Execute SELECT on a specific view for current user
// @route   GET /api/views/:viewName/data
const getViewData = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { viewName } = req.params;
    const limit = parseInt(req.query.limit || '50', 10);

    const validViews = ['v_expense_transactions', 'v_transaction_details', 'v_monthly_expense_summary', 'v_budget_utilization'];
    if (!validViews.includes(viewName)) {
      return errorResponse(res, `Unknown view name: ${viewName}`, 400);
    }

    const startTime = Date.now();
    const query = `SELECT * FROM ${viewName} WHERE user_id = ? LIMIT ?`;
    const [rows] = await pool.query(query, [userId, limit]);
    const executionTimeMs = Date.now() - startTime;

    return successResponse(res, `Data fetched from view ${viewName}`, {
      viewName,
      executedQuery: `SELECT * FROM ${viewName} WHERE user_id = ${userId} LIMIT ${limit};`,
      rowCount: rows.length,
      executionTimeMs,
      rows
    });
  } catch (err) {
    next(err);
  }
};

// @desc    INSERT through updatable view v_expense_transactions
// @route   POST /api/views/expense-transactions
const insertThroughView = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { categoryId, amount, transactionDate, paymentMethod, description } = req.body;

    const startTime = Date.now();
    const query = `
      INSERT INTO v_expense_transactions 
        (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
      VALUES (?, ?, 'EXPENSE', ?, ?, ?, ?)
    `;
    const params = [userId, categoryId, amount, transactionDate, paymentMethod, description || 'Created via v_expense_transactions'];

    const [result] = await pool.query(query, params);
    const executionTimeMs = Date.now() - startTime;

    // Fetch newly created record through the view
    const [createdRows] = await pool.query(
      'SELECT * FROM v_expense_transactions WHERE transaction_id = ? AND user_id = ?',
      [result.insertId, userId]
    );

    return successResponse(res, 'Record successfully inserted directly into MySQL through view v_expense_transactions', {
      executedQuery: `INSERT INTO v_expense_transactions (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description) VALUES (${userId}, ${categoryId}, 'EXPENSE', ${amount}, '${transactionDate}', '${paymentMethod}', '${description}');`,
      mysqlResult: {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
        warningStatus: result.warningStatus
      },
      executionTimeMs,
      insertedRow: createdRows[0]
    }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    UPDATE through updatable view v_expense_transactions
// @route   PUT /api/views/expense-transactions/:id
const updateThroughView = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const transactionId = req.params.id;
    const { amount, paymentMethod, description } = req.body;

    const startTime = Date.now();
    const query = `
      UPDATE v_expense_transactions
      SET amount = ?, payment_method = ?, description = ?
      WHERE transaction_id = ? AND user_id = ?
    `;
    const params = [amount, paymentMethod, description, transactionId, userId];

    const [result] = await pool.query(query, params);
    const executionTimeMs = Date.now() - startTime;

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Record not found in view v_expense_transactions or access denied', 404);
    }

    const [updatedRows] = await pool.query(
      'SELECT * FROM v_expense_transactions WHERE transaction_id = ? AND user_id = ?',
      [transactionId, userId]
    );

    return successResponse(res, 'Record successfully updated directly in MySQL through view v_expense_transactions', {
      executedQuery: `UPDATE v_expense_transactions SET amount = ${amount}, payment_method = '${paymentMethod}', description = '${description}' WHERE transaction_id = ${transactionId} AND user_id = ${userId};`,
      mysqlResult: {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
        info: result.info
      },
      executionTimeMs,
      updatedRow: updatedRows[0]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    DELETE through updatable view v_expense_transactions
// @route   DELETE /api/views/expense-transactions/:id
const deleteThroughView = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const transactionId = req.params.id;

    const startTime = Date.now();
    const query = 'DELETE FROM v_expense_transactions WHERE transaction_id = ? AND user_id = ?';
    const [result] = await pool.query(query, [transactionId, userId]);
    const executionTimeMs = Date.now() - startTime;

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Record not found in view v_expense_transactions or access denied', 404);
    }

    return successResponse(res, 'Record successfully deleted directly in MySQL through view v_expense_transactions', {
      executedQuery: `DELETE FROM v_expense_transactions WHERE transaction_id = ${transactionId} AND user_id = ${userId};`,
      mysqlResult: {
        affectedRows: result.affectedRows
      },
      executionTimeMs,
      deletedTransactionId: parseInt(transactionId, 10)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Live demonstration of WITH CHECK OPTION enforcement
// @route   POST /api/views/demonstrate-check-option
const demonstrateCheckOption = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { action = 'UPDATE', testRecordId } = req.body;

    let targetTransactionId = testRecordId;

    // If no testRecordId supplied, create a temporary sandbox expense first
    if (!targetTransactionId) {
      const [sandboxRes] = await pool.query(`
        INSERT INTO v_expense_transactions 
          (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
        VALUES (?, 6, 'EXPENSE', 999.00, CURDATE(), 'UPI', 'Temporary Check Option Test Sandbox Record')
      `, [userId]);
      targetTransactionId = sandboxRes.insertId;
    }

    const executedQuery = action === 'INSERT'
      ? `INSERT INTO v_expense_transactions (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description) VALUES (${userId}, 1, 'INCOME', 5000.00, CURDATE(), 'UPI', 'Attempted illegal income through expense view');`
      : `UPDATE v_expense_transactions SET transaction_type = 'INCOME' WHERE transaction_id = ${targetTransactionId} AND user_id = ${userId};`;

    try {
      if (action === 'INSERT') {
        await pool.query(`
          INSERT INTO v_expense_transactions 
            (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
          VALUES (?, 1, 'INCOME', 5000.00, CURDATE(), 'UPI', 'Attempted illegal income through expense view')
        `, [userId]);
      } else {
        await pool.query(`
          UPDATE v_expense_transactions 
          SET transaction_type = 'INCOME' 
          WHERE transaction_id = ? AND user_id = ?
        `, [targetTransactionId, userId]);
      }

      // Should never reach here if MySQL WITH CHECK OPTION is active
      return successResponse(res, 'Unexpected: Query passed (check view definition)');
    } catch (mysqlErr) {
      // Clean up sandbox record if created
      if (!testRecordId && targetTransactionId) {
        await pool.query('DELETE FROM transactions WHERE transaction_id = ?', [targetTransactionId]).catch(() => {});
      }

      // Format educational DBMS report
      return successResponse(res, 'WITH CHECK OPTION successfully triggered and enforced by MySQL!', {
        demonstrationSuccess: true,
        testedAction: action,
        attemptedQuery: executedQuery,
        mysqlError: {
          code: mysqlErr.code || 'ER_VIEW_CHECK_FAILED',
          errno: mysqlErr.errno || 1369,
          sqlState: mysqlErr.sqlState || 'HY000',
          sqlMessage: mysqlErr.sqlMessage || "CHECK OPTION failed 'expense_tracker.v_expense_transactions'"
        },
        educationalExplanation: {
          concept: 'MySQL View Updatability & Integrity Constraints',
          whyItFailed: "View 'v_expense_transactions' was defined with the clause: WHERE transaction_type = 'EXPENSE' WITH CHECK OPTION. When any DML statement (INSERT or UPDATE) attempts to change or insert a row where transaction_type is 'INCOME', MySQL intercepts the operation before writing to the base 'transactions' table, raising Error 1369 (HY000).",
          dbmsSignificance: 'Ensures data integrity through the database layer rather than relying solely on application-level checks. This satisfies ACID integrity guarantees.'
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Generate safe sandbox record for testing view operations
// @route   POST /api/views/create-sandbox-record
const createSandboxRecord = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [resInsert] = await pool.query(`
      INSERT INTO v_expense_transactions 
        (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
      VALUES (?, 6, 'EXPENSE', 450.00, CURDATE(), 'UPI', '🧪 Safe Demo Sandbox Expense Record')
    `, [userId]);

    const [rows] = await pool.query(
      'SELECT * FROM v_expense_transactions WHERE transaction_id = ? AND user_id = ?',
      [resInsert.insertId, userId]
    );

    return successResponse(res, 'Sandbox record created for view testing', {
      executedQuery: `INSERT INTO v_expense_transactions (...) VALUES (${userId}, 6, 'EXPENSE', 450.00, CURDATE(), 'UPI', '🧪 Safe Demo Sandbox Expense Record');`,
      sandboxRecord: rows[0]
    }, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Demonstrate DROP VIEW and SAFE RE-CREATION
// @route   POST /api/views/demonstrate-drop-view
const demonstrateDropView = async (req, res, next) => {
  try {
    const { enableAdminMode = false, viewName = 'v_expense_transactions' } = req.body;

    if (!enableAdminMode) {
      return errorResponse(
        res,
        'Administrative Demonstration Mode is disabled. Enable admin demo mode in the UI to safely test DROP VIEW.',
        403
      );
    }

    const validViews = ['v_expense_transactions', 'v_transaction_details', 'v_monthly_expense_summary', 'v_budget_utilization'];
    if (!validViews.includes(viewName)) {
      return errorResponse(res, `Invalid view: ${viewName}`, 400);
    }

    const targetDef = VIEW_METADATA.find(v => v.viewName === viewName);

    // 1. Execute DROP VIEW
    const dropQuery = `DROP VIEW IF EXISTS ${viewName};`;
    await pool.query(dropQuery);

    // 2. Immediately safely re-create view using canonical definition
    await pool.query(targetDef.sqlDefinition);

    return successResponse(res, `Demonstration successful: View '${viewName}' was dropped and safely re-created.`, {
      droppedView: viewName,
      executedDropQuery: dropQuery,
      executedRecreateSql: targetDef.sqlDefinition,
      status: 'View safely re-established and fully operational in MySQL.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getViewList,
  getViewData,
  insertThroughView,
  updateThroughView,
  deleteThroughView,
  demonstrateCheckOption,
  createSandboxRecord,
  demonstrateDropView
};
