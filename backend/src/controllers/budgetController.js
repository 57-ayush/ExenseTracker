const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Normalize month string to YYYY-MM-01
const normalizeMonth = (monthStr) => {
  if (!monthStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  }
  const parts = monthStr.split('-');
  return `${parts[0]}-${parts[1].padStart(2, '0')}-01`;
};

// @desc    Get all budgets with live actual spending for authenticated user
// @route   GET /api/budgets
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { month } = req.query;
    const targetMonth = normalizeMonth(month);
    const monthPrefix = targetMonth.substring(0, 7); // 'YYYY-MM'

    // Query budgets with real transaction expenses aggregation
    const query = `
      SELECT 
        b.budget_id,
        b.user_id,
        b.category_id,
        c.category_name,
        c.category_type,
        DATE_FORMAT(b.budget_month, '%Y-%m-01') AS budget_month,
        DATE_FORMAT(b.budget_month, '%Y-%m') AS formatted_month,
        b.budget_amount,
        COALESCE(spent.total_spent, 0) AS amount_spent,
        (b.budget_amount - COALESCE(spent.total_spent, 0)) AS remaining_budget,
        ROUND(
          CASE 
            WHEN b.budget_amount > 0 THEN (COALESCE(spent.total_spent, 0) / b.budget_amount) * 100 
            ELSE 0 
          END, 
          2
        ) AS percentage_used,
        CASE 
          WHEN COALESCE(spent.total_spent, 0) > b.budget_amount THEN 'Exceeded'
          WHEN COALESCE(spent.total_spent, 0) >= (b.budget_amount * 0.85) THEN 'Near Limit'
          ELSE 'On Track'
        END AS budget_status
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN (
        SELECT 
          category_id,
          SUM(amount) AS total_spent
        FROM transactions
        WHERE user_id = ?
          AND transaction_type = 'EXPENSE'
          AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
        GROUP BY category_id
      ) spent ON b.category_id = spent.category_id
      WHERE b.user_id = ?
        AND DATE_FORMAT(b.budget_month, '%Y-%m') = ?
      ORDER BY b.budget_amount DESC
    `;

    const [rows] = await pool.query(query, [userId, monthPrefix, userId, monthPrefix]);

    // Compute overall budget summary for the month
    const totalBudget = rows.reduce((acc, row) => acc + Number(row.budget_amount), 0);
    const totalSpent = rows.reduce((acc, row) => acc + Number(row.amount_spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(2)) : 0;

    return successResponse(res, 'Budgets retrieved successfully', rows, 200, {
      selectedMonth: monthPrefix,
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      statusCount: {
        onTrack: rows.filter(r => r.budget_status === 'On Track').length,
        nearLimit: rows.filter(r => r.budget_status === 'Near Limit').length,
        exceeded: rows.filter(r => r.budget_status === 'Exceeded').length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or upsert budget
// @route   POST /api/budgets
const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { categoryId, budgetMonth, budgetAmount } = req.body;
    const normalizedMonth = normalizeMonth(budgetMonth);

    // Verify category is EXPENSE
    const [cat] = await pool.query('SELECT category_id, category_name, category_type FROM categories WHERE category_id = ?', [categoryId]);
    if (cat.length === 0) {
      return errorResponse(res, 'Category does not exist', 400);
    }
    if (cat[0].category_type !== 'EXPENSE') {
      return errorResponse(res, 'Budgets can only be set for EXPENSE categories', 400);
    }

    // Insert or update on duplicate
    const [result] = await pool.query(`
      INSERT INTO budgets (user_id, category_id, budget_month, budget_amount)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE budget_amount = VALUES(budget_amount)
    `, [userId, categoryId, normalizedMonth, budgetAmount]);

    const budgetId = result.insertId || (
      await pool.query(
        'SELECT budget_id FROM budgets WHERE user_id = ? AND category_id = ? AND budget_month = ?',
        [userId, categoryId, normalizedMonth]
      )
    )[0][0].budget_id;

    const [created] = await pool.query(`
      SELECT 
        b.budget_id,
        b.user_id,
        b.category_id,
        c.category_name,
        DATE_FORMAT(b.budget_month, '%Y-%m-01') AS budget_month,
        b.budget_amount
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      WHERE b.budget_id = ?
    `, [budgetId]);

    return successResponse(res, 'Budget saved successfully', created[0], 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const budgetId = req.params.id;
    const { budgetAmount, categoryId, budgetMonth } = req.body;

    const [existing] = await pool.query('SELECT budget_id FROM budgets WHERE budget_id = ? AND user_id = ?', [budgetId, userId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Budget not found or access denied', 404);
    }

    let updateQuery = 'UPDATE budgets SET budget_amount = ?';
    const params = [budgetAmount];

    if (categoryId) {
      updateQuery += ', category_id = ?';
      params.push(categoryId);
    }

    if (budgetMonth) {
      updateQuery += ', budget_month = ?';
      params.push(normalizeMonth(budgetMonth));
    }

    updateQuery += ' WHERE budget_id = ? AND user_id = ?';
    params.push(budgetId, userId);

    await pool.query(updateQuery, params);

    const [updated] = await pool.query(`
      SELECT 
        b.budget_id,
        b.user_id,
        b.category_id,
        c.category_name,
        DATE_FORMAT(b.budget_month, '%Y-%m-01') AS budget_month,
        b.budget_amount
      FROM budgets b
      JOIN categories c ON b.category_id = c.category_id
      WHERE b.budget_id = ?
    `, [budgetId]);

    return successResponse(res, 'Budget updated successfully', updated[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const budgetId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM budgets WHERE budget_id = ? AND user_id = ?',
      [budgetId, userId]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Budget not found or access denied', 404);
    }

    return successResponse(res, 'Budget deleted successfully', { budgetId: parseInt(budgetId, 10) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
