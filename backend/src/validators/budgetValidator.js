const { body } = require('express-validator');

const budgetValidator = [
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('budgetMonth')
    .notEmpty().withMessage('Budget month is required')
    .matches(/^\d{4}-\d{2}(-\d{2})?$/).withMessage('Budget month must be YYYY-MM or YYYY-MM-DD'),
  body('budgetAmount')
    .notEmpty().withMessage('Budget amount is required')
    .isFloat({ min: 0.01 }).withMessage('Budget amount must be greater than zero')
];

module.exports = {
  budgetValidator
};
