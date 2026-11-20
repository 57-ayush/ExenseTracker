const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { budgetValidator } = require('../validators/budgetValidator');

router.use(authenticateToken);

router.get('/', budgetController.getBudgets);
router.post('/', budgetValidator, validate, budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
