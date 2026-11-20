const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/monthly-trends', dashboardController.getMonthlyTrends);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
