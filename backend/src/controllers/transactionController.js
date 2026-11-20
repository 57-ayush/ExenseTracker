const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get all transactions for authenticated user with filters & pagination
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const {
      page = 1,
      limit = 10,
      search = '',
      type,
      categoryId,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const pageLimit = parseInt(limit, 10);

    // Build WHERE clauses with parameterization
    const whereConditions = ['t.user_id = ?'];
    const queryParams = [userId];

    if (type && ['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      whereConditions.push('t.transaction_type = ?');
      queryParams.push(type.toUpperCase());
    }

    if (categoryId) {
      whereConditions.push('t.category_id = ?');
      queryParams.push(parseInt(categoryId, 10));
    }

    if (paymentMethod && ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'].includes(paymentMethod.toUpperCase())) {
      whereConditions.push('t.payment_method = ?');
      queryParams.push(paymentMethod.toUpperCase());
    }

    if (startDate) {
      whereConditions.push('t.transaction_date >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('t.transaction_date <= ?');
      queryParams.push(endDate);
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(t.description LIKE ? OR c.category_name LIKE ?)');
      queryParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Validate sorting column to prevent injection
    const allowedSortColumns = {
      transaction_date: 't.transaction_date',
      amount: 't.amount',
      created_at: 't.created_at',
      category_name: 'c.category_name'
    };
    const sortCol = allowedSortColumns[sortBy] || 't.transaction_date';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 1. Get total count and aggregate summary
    const [countRows] = await pool.query(`
      SELECT 
        COUNT(t.transaction_id) AS totalCount,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS totalExpense
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE ${whereClause}
    `, queryParams);

    const totalCount = countRows[0].totalCount || 0;
    const totalIncome = Number(countRows[0].totalIncome) || 0;
    const totalExpense = Number(countRows[0].totalExpense) || 0;

    // 2. Query paginated records using JOIN with categories
    const selectQuery = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.category_id,
        c.category_name,
        c.category_type,
        t.transaction_type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method,
        t.description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${orderDirection}, t.transaction_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(selectQuery, [...queryParams, pageLimit, offset]);

    return successResponse(
      res,
      'Transactions retrieved successfully',
      rows,
      200,
      {
        total: totalCount,
        page: parseInt(page, 10),
        limit: pageLimit,
        totalPages: Math.ceil(totalCount / pageLimit) || 1,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense
      }
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const transactionId = req.params.id;

    const [rows] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.user_id,
        t.category_id,
        c.category_name,
        c.category_type,
        t.transaction_type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method,
        t.description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.transaction_id = ? AND t.user_id = ?
    `, [transactionId, userId]);

    if (rows.length === 0) {
      return errorResponse(res, 'Transaction not found or access denied', 404);
    }

    return successResponse(res, 'Transaction details retrieved', rows[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { categoryId, transactionType, amount, transactionDate, paymentMethod, description } = req.body;

    // Validate category exists and matches type
    const [cat] = await pool.query('SELECT category_id, category_name, category_type FROM categories WHERE category_id = ?', [categoryId]);
    if (cat.length === 0) {
      return errorResponse(res, 'Specified category does not exist', 400);
    }

    if (cat[0].category_type !== transactionType) {
      return errorResponse(
        res,
        `Category '${cat[0].category_name}' is for ${cat[0].category_type}, but transaction was marked as ${transactionType}`,
        400
      );
    }

    const [result] = await pool.query(
      `INSERT INTO transactions 
        (user_id, category_id, transaction_type, amount, transaction_date, payment_method, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, categoryId, transactionType, amount, transactionDate, paymentMethod, description || null]
    );

    const [created] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.user_id,
        t.category_id,
        c.category_name,
        c.category_type,
        t.transaction_type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method,
        t.description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.transaction_id = ?
    `, [result.insertId]);

    return successResponse(res, 'Transaction recorded successfully', created[0], 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const transactionId = req.params.id;
    const { categoryId, transactionType, amount, transactionDate, paymentMethod, description } = req.body;

    // Verify ownership
    const [existing] = await pool.query('SELECT transaction_id FROM transactions WHERE transaction_id = ? AND user_id = ?', [transactionId, userId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Transaction not found or access denied', 404);
    }

    // Verify category
    const [cat] = await pool.query('SELECT category_id, category_name, category_type FROM categories WHERE category_id = ?', [categoryId]);
    if (cat.length === 0) {
      return errorResponse(res, 'Specified category does not exist', 400);
    }

    if (cat[0].category_type !== transactionType) {
      return errorResponse(
        res,
        `Category '${cat[0].category_name}' is for ${cat[0].category_type}, but transaction was marked as ${transactionType}`,
        400
      );
    }

    await pool.query(
      `UPDATE transactions 
       SET category_id = ?, transaction_type = ?, amount = ?, transaction_date = ?, payment_method = ?, description = ?
       WHERE transaction_id = ? AND user_id = ?`,
      [categoryId, transactionType, amount, transactionDate, paymentMethod, description || null, transactionId, userId]
    );

    const [updated] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.user_id,
        t.category_id,
        c.category_name,
        c.category_type,
        t.transaction_type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method,
        t.description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.transaction_id = ?
    `, [transactionId]);

    return successResponse(res, 'Transaction updated successfully', updated[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const transactionId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?',
      [transactionId, userId]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Transaction not found or access denied', 404);
    }

    return successResponse(res, 'Transaction deleted successfully', { transactionId: parseInt(transactionId, 10) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
