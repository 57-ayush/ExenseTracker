const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { transactionValidator } = require('../validators/transactionValidator');

router.use(authenticateToken);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionValidator, validate, transactionController.createTransaction);
router.put('/:id', transactionValidator, validate, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
