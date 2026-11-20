const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// View metadata & data queries
router.get('/', viewController.getViewList);
router.get('/:viewName/data', viewController.getViewData);

// Updatable View DML (INSERT, UPDATE, DELETE) through v_expense_transactions
router.post('/expense-transactions', viewController.insertThroughView);
router.put('/expense-transactions/:id', viewController.updateThroughView);
router.delete('/expense-transactions/:id', viewController.deleteThroughView);

// Academic DBMS Demonstrations
router.post('/demonstrate-check-option', viewController.demonstrateCheckOption);
router.post('/create-sandbox-record', viewController.createSandboxRecord);
router.post('/demonstrate-drop-view', viewController.demonstrateDropView);

module.exports = router;
