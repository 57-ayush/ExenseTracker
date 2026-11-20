const { body } = require('express-validator');

const categoryValidator = [
  body('categoryName')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Category name must be between 2 and 60 characters'),
  body('categoryType')
    .notEmpty().withMessage('Category type is required')
    .isIn(['INCOME', 'EXPENSE']).withMessage('Category type must be INCOME or EXPENSE')
];

module.exports = {
  categoryValidator
};
