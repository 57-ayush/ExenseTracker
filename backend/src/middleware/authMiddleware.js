const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { errorResponse } = require('../utils/responseHelper');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access Denied: Missing authorization token', 401);
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_expense_tracker_dbms_2026_cse_btech';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return errorResponse(res, 'Invalid or expired session token', 401);
    }

    // Verify user exists in database
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, created_at FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User record not found or has been removed', 401);
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticateToken;
