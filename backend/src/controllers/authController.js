const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_expense_tracker_dbms_2026_cse_btech';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, email }, secret, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if email already registered
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email address already exists', 409);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [fullName, email, passwordHash]
    );

    const userId = result.insertId;
    const token = generateToken(userId, email);

    return successResponse(
      res,
      'User registered successfully',
      {
        user: {
          userId,
          fullName,
          email
        },
        token
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Login existing user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check user existence
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, created_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Invalid email or password credentials', 401);
    }

    const user = rows[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password credentials', 401);
    }

    const token = generateToken(user.user_id, user.email);

    return successResponse(res, 'Login successful', {
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated user profile and stats
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Fetch user statistics
    const [stats] = await pool.query(`
      SELECT 
        COUNT(transaction_id) AS totalTransactions,
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS totalExpense
      FROM transactions
      WHERE user_id = ?
    `, [userId]);

    const [budgetStats] = await pool.query(`
      SELECT COUNT(budget_id) AS totalBudgets FROM budgets WHERE user_id = ?
    `, [userId]);

    return successResponse(res, 'User profile fetched successfully', {
      user: {
        userId: req.user.user_id,
        fullName: req.user.full_name,
        email: req.user.email,
        createdAt: req.user.created_at,
        stats: {
          totalTransactions: stats[0].totalTransactions || 0,
          totalIncome: Number(stats[0].totalIncome) || 0,
          totalExpense: Number(stats[0].totalExpense) || 0,
          totalBudgets: budgetStats[0].totalBudgets || 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { fullName, currentPassword, newPassword } = req.body;

    if (fullName) {
      await pool.query('UPDATE users SET full_name = ? WHERE user_id = ?', [fullName, userId]);
    }

    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to set a new password', 400);
      }
      const [rows] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isMatch) {
        return errorResponse(res, 'Current password verification failed', 400);
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, userId]);
    }

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, 'Profile updated successfully', {
      user: {
        userId: updated[0].user_id,
        fullName: updated[0].full_name,
        email: updated[0].email,
        createdAt: updated[0].created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
