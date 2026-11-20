const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get monthly financial aggregate report
// @route   GET /api/reports/monthly
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Utilize v_monthly_expense_summary view or aggregated query
    const [rows] = await pool.query(`
      SELECT 
        user_id,
        month_date,
        formatted_month,
        total_income,
        total_expenses,
        net_savings,
        total_transactions,
        ROUND(
          CASE 
            WHEN total_income > 0 THEN ((net_savings / total_income) * 100) 
            ELSE 0 
          END, 
          2
        ) AS savings_rate_percentage
      FROM v_monthly_expense_summary
      WHERE user_id = ?
      ORDER BY month_date DESC
    `, [userId]);

    return successResponse(res, 'Monthly report retrieved successfully', rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Get category-wise spending report with statistics
// @route   GET /api/reports/category-wise
const getCategoryWiseReport = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { startDate, endDate } = req.query;

    const whereConditions = ["t.user_id = ?", "t.transaction_type = 'EXPENSE'"];
    const params = [userId];

    if (startDate) {
      whereConditions.push('t.transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('t.transaction_date <= ?');
      params.push(endDate);
    }

    const [rows] = await pool.query(`
      SELECT 
        c.category_id,
        c.category_name,
        COALESCE(SUM(t.amount), 0) AS total_spent,
        COUNT(t.transaction_id) AS transaction_count,
        ROUND(AVG(t.amount), 2) AS average_per_transaction,
        MIN(t.amount) AS minimum_spend,
        MAX(t.amount) AS maximum_spend
      FROM categories c
      JOIN transactions t ON c.category_id = t.category_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY c.category_id, c.category_name
      ORDER BY total_spent DESC
    `, params);

    const grandTotal = rows.reduce((sum, r) => sum + Number(r.total_spent), 0);

    const enriched = rows.map(r => ({
      ...r,
      total_spent: Number(r.total_spent),
      percentage_of_total: grandTotal > 0 ? Number(((r.total_spent / grandTotal) * 100).toFixed(2)) : 0
    }));

    return successResponse(res, 'Category-wise spending report generated', {
      grandTotal,
      categories: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment method analysis
// @route   GET /api/reports/payment-methods
const getPaymentMethodReport = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { startDate, endDate } = req.query;

    const whereConditions = ['t.user_id = ?'];
    const params = [userId];

    if (startDate) {
      whereConditions.push('t.transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('t.transaction_date <= ?');
      params.push(endDate);
    }

    const [rows] = await pool.query(`
      SELECT 
        payment_method,
        COUNT(transaction_id) AS transaction_count,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(amount), 0) AS total_volume
      FROM transactions t
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY payment_method
      ORDER BY total_volume DESC
    `, params);

    return successResponse(res, 'Payment method analysis generated', rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Get budget utilization report
// @route   GET /api/reports/budget-utilization
const getBudgetUtilizationReport = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Use view v_budget_utilization
    const [rows] = await pool.query(`
      SELECT 
        budget_id,
        category_name,
        budget_month,
        formatted_month,
        budget_amount,
        amount_spent,
        remaining_budget,
        percentage_used,
        budget_status
      FROM v_budget_utilization
      WHERE user_id = ?
      ORDER BY budget_month DESC, percentage_used DESC
    `, [userId]);

    return successResponse(res, 'Budget utilization report retrieved from view', rows);
  } catch (err) {
    next(err);
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/reports/export-csv
const exportTransactionsCsv = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { startDate, endDate, type } = req.query;

    const whereConditions = ['t.user_id = ?'];
    const params = [userId];

    if (startDate) {
      whereConditions.push('t.transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('t.transaction_date <= ?');
      params.push(endDate);
    }
    if (type) {
      whereConditions.push('t.transaction_type = ?');
      params.push(type.toUpperCase());
    }

    const [rows] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.transaction_date,
        t.transaction_type,
        c.category_name,
        t.amount,
        t.payment_method,
        COALESCE(t.description, '') AS description,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
    `, params);

    // Build CSV string
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Created At'];
    const csvLines = [headers.join(',')];

    rows.forEach(r => {
      const escapedDesc = `"${r.description.replace(/"/g, '""')}"`;
      csvLines.push([
        r.transaction_id,
        r.transaction_date,
        r.transaction_type,
        `"${r.category_name}"`,
        r.amount,
        r.payment_method,
        escapedDesc,
        `"${r.created_at}"`
      ].join(','));
    });

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_export_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMonthlyReport,
  getCategoryWiseReport,
  getPaymentMethodReport,
  getBudgetUtilizationReport,
  exportTransactionsCsv
};
