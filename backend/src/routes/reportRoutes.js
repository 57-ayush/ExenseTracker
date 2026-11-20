const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/monthly', reportController.getMonthlyReport);
router.get('/category-wise', reportController.getCategoryWiseReport);
router.get('/payment-methods', reportController.getPaymentMethodReport);
router.get('/budget-utilization', reportController.getBudgetUtilizationReport);
router.get('/export-csv', reportController.exportTransactionsCsv);

module.exports = router;
