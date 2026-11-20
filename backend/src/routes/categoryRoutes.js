const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { categoryValidator } = require('../validators/categoryValidator');

router.use(authenticateToken);

router.get('/', categoryController.getCategories);
router.post('/', categoryValidator, validate, categoryController.createCategory);
router.put('/:id', categoryValidator, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
