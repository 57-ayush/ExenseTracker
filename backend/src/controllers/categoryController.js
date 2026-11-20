const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get all categories with reference counts
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    let query = `
      SELECT 
        c.category_id,
        c.category_name,
        c.category_type,
        c.created_at,
        COUNT(DISTINCT t.transaction_id) AS transaction_count,
        COUNT(DISTINCT b.budget_id) AS budget_count
      FROM categories c
      LEFT JOIN transactions t ON c.category_id = t.category_id
      LEFT JOIN budgets b ON c.category_id = b.category_id
    `;
    const params = [];

    if (type && ['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      query += ' WHERE c.category_type = ?';
      params.push(type.toUpperCase());
    }

    query += ' GROUP BY c.category_id, c.category_name, c.category_type, c.created_at ORDER BY c.category_type ASC, c.category_name ASC';

    const [rows] = await pool.query(query, params);

    // Group by type for frontend convenience
    const incomeCategories = rows.filter(cat => cat.category_type === 'INCOME');
    const expenseCategories = rows.filter(cat => cat.category_type === 'EXPENSE');

    return successResponse(res, 'Categories retrieved successfully', {
      all: rows,
      income: incomeCategories,
      expense: expenseCategories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { categoryName, categoryType } = req.body;

    // Check duplicate
    const [existing] = await pool.query(
      'SELECT category_id FROM categories WHERE category_name = ? AND category_type = ?',
      [categoryName.trim(), categoryType.toUpperCase()]
    );

    if (existing.length > 0) {
      return errorResponse(
        res,
        `A category named '${categoryName}' already exists under '${categoryType}'`,
        409
      );
    }

    const [result] = await pool.query(
      'INSERT INTO categories (category_name, category_type) VALUES (?, ?)',
      [categoryName.trim(), categoryType.toUpperCase()]
    );

    const [created] = await pool.query(
      'SELECT category_id, category_name, category_type, created_at FROM categories WHERE category_id = ?',
      [result.insertId]
    );

    return successResponse(res, 'Category created successfully', created[0], 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const { categoryName, categoryType } = req.body;

    const [existing] = await pool.query('SELECT category_id FROM categories WHERE category_id = ?', [categoryId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Category not found', 404);
    }

    // Check conflict
    const [conflict] = await pool.query(
      'SELECT category_id FROM categories WHERE category_name = ? AND category_type = ? AND category_id != ?',
      [categoryName.trim(), categoryType.toUpperCase(), categoryId]
    );

    if (conflict.length > 0) {
      return errorResponse(
        res,
        `Another category named '${categoryName}' already exists under '${categoryType}'`,
        409
      );
    }

    await pool.query(
      'UPDATE categories SET category_name = ?, category_type = ? WHERE category_id = ?',
      [categoryName.trim(), categoryType.toUpperCase(), categoryId]
    );

    const [updated] = await pool.query(
      'SELECT category_id, category_name, category_type, created_at FROM categories WHERE category_id = ?',
      [categoryId]
    );

    return successResponse(res, 'Category updated successfully', updated[0]);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category with referential integrity guard
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const { reassignToCategoryId } = req.body;

    const [existing] = await pool.query('SELECT category_id, category_name, category_type FROM categories WHERE category_id = ?', [categoryId]);
    if (existing.length === 0) {
      return errorResponse(res, 'Category not found', 404);
    }

    const category = existing[0];

    // Check usage in transactions
    const [transCount] = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [categoryId]
    );

    // Check usage in budgets
    const [budgetCount] = await pool.query(
      'SELECT COUNT(*) as count FROM budgets WHERE category_id = ?',
      [categoryId]
    );

    const transactionsReferencing = transCount[0].count;
    const budgetsReferencing = budgetCount[0].count;

    if (transactionsReferencing > 0 || budgetsReferencing > 0) {
      // If reassignment category provided
      if (reassignToCategoryId) {
        const [targetCat] = await pool.query(
          'SELECT category_id, category_name FROM categories WHERE category_id = ? AND category_type = ?',
          [reassignToCategoryId, category.category_type]
        );

        if (targetCat.length === 0) {
          return errorResponse(
            res,
            'Target reassignment category does not exist or does not match the same type',
            400
          );
        }

        // Reassign
        await pool.query('UPDATE transactions SET category_id = ? WHERE category_id = ?', [reassignToCategoryId, categoryId]);
        await pool.query('DELETE FROM budgets WHERE category_id = ?', [categoryId]);
      } else {
        return errorResponse(
          res,
          `Cannot delete category '${category.category_name}' because it is referenced by ${transactionsReferencing} transaction(s) and ${budgetsReferencing} budget(s). Delete or reassign those records first.`,
          400,
          null,
          {
            categoryId: parseInt(categoryId, 10),
            categoryName: category.category_name,
            transactionCount: transactionsReferencing,
            budgetCount: budgetsReferencing,
            requiresReassignment: true
          }
        );
      }
    }

    await pool.query('DELETE FROM categories WHERE category_id = ?', [categoryId]);

    return successResponse(res, `Category '${category.category_name}' deleted successfully`, {
      categoryId: parseInt(categoryId, 10)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
