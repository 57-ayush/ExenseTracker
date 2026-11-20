const pool = require('../config/db');
const { successResponse } = require('../utils/responseHelper');

// Helper to resolve date boundaries based on filter
const getDateRange = (filter, customStart, customEnd) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let startDate, endDate;

  switch (filter) {
    case 'last-month': {
      const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayLastMonth = new Date(currentYear, currentMonth, 0);
      startDate = firstDayLastMonth.toISOString().split('T')[0];
      endDate = lastDayLastMonth.toISOString().split('T')[0];
      break;
    }
    case '3-months': {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
      const today = new Date();
      startDate = threeMonthsAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
      break;
    }
    case 'this-year': {
      startDate = `${currentYear}-01-01`;
      endDate = `${currentYear}-12-31`;
      break;
    }
    case 'custom': {
      startDate = customStart || `${currentYear}-01-01`;
      endDate = customEnd || now.toISOString().split('T')[0];
      break;
    }
    case 'this-month':
    default: {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      startDate = firstDay.toISOString().split('T')[0];
      endDate = lastDay.toISOString().split('T')[0];
      break;
    }
  }

  return { startDate, endDate };
};

// @desc    Get dashboard metrics & summary
// @route   GET /api/dashboard/summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { filter = 'this-month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(filter, customStart, customEnd);
    const monthPrefix = startDate.substring(0, 7);

    // 1. Total Income & Total Expenses in selected period
    const [summaryRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COUNT(transaction_id) AS transactionCount
      FROM transactions
      WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
    `, [userId, startDate, endDate]);

    const totalIncome = Number(summaryRows[0].totalIncome) || 0;
    const totalExpenses = Number(summaryRows[0].totalExpenses) || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // 2. Total active monthly budget for the period's month
    const [budgetRows] = await pool.query(`
      SELECT COALESCE(SUM(budget_amount), 0) AS totalBudget
      FROM budgets
      WHERE user_id = ? AND DATE_FORMAT(budget_month, '%Y-%m') = ?
    `, [userId, monthPrefix]);

    const monthlyBudget = Number(budgetRows[0].totalBudget) || 0;

    // 3. Highest spending category in this period
    const [topCatRows] = await pool.query(`
      SELECT 
        c.category_id,
        c.category_name,
        SUM(t.amount) AS categoryTotal
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ? AND t.transaction_type = 'EXPENSE' AND t.transaction_date BETWEEN ? AND ?
      GROUP BY c.category_id, c.category_name
      ORDER BY categoryTotal DESC
      LIMIT 1
    `, [userId, startDate, endDate]);

    const highestCategory = topCatRows.length > 0 ? {
      name: topCatRows[0].category_name,
      amount: Number(topCatRows[0].categoryTotal),
      percentage: totalExpenses > 0 ? Number(((topCatRows[0].categoryTotal / totalExpenses) * 100).toFixed(1)) : 0
    } : null;

    return successResponse(res, 'Dashboard summary calculated successfully', {
      period: { filter, startDate, endDate },
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      monthlyBudget,
      highestCategory,
      transactionCount: summaryRows[0].transactionCount || 0
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get monthly spending trend for charts
// @route   GET /api/dashboard/monthly-trends
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Query last 6 months trend using SQL aggregate
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        DATE_FORMAT(transaction_date, '%b %Y') AS monthLabel,
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense,
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE -amount END), 0) AS savings
      FROM transactions
      WHERE user_id = ? AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), DATE_FORMAT(transaction_date, '%b %Y')
      ORDER BY month ASC
    `, [userId]);

    return successResponse(res, 'Monthly trends retrieved successfully', rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Get category-wise expense breakdown for pie chart
// @route   GET /api/dashboard/category-breakdown
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { filter = 'this-month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(filter, customStart, customEnd);

    const [rows] = await pool.query(`
      SELECT 
        c.category_id,
        c.category_name AS name,
        COALESCE(SUM(t.amount), 0) AS value,
        COUNT(t.transaction_id) AS count
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ? AND t.transaction_type = 'EXPENSE' AND t.transaction_date BETWEEN ? AND ?
      GROUP BY c.category_id, c.category_name
      ORDER BY value DESC
    `, [userId, startDate, endDate]);

    const totalExpense = rows.reduce((acc, curr) => acc + Number(curr.value), 0);

    const formatted = rows.map(r => ({
      categoryId: r.category_id,
      name: r.name,
      value: Number(r.value),
      count: r.count,
      percentage: totalExpense > 0 ? Number(((r.value / totalExpense) * 100).toFixed(1)) : 0
    }));

    return successResponse(res, 'Category breakdown retrieved successfully', {
      totalExpense,
      categories: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent 5 transactions
// @route   GET /api/dashboard/recent-transactions
const getRecentTransactions = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.category_id,
        c.category_name,
        t.transaction_type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date,
        t.payment_method,
        t.description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
      LIMIT 5
    `, [userId]);

    return successResponse(res, 'Recent transactions retrieved', rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getRecentTransactions
};
