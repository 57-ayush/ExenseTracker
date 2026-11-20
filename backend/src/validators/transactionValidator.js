const { body, query } = require('express-validator');

const transactionValidator = [
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('transactionType')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['INCOME', 'EXPENSE']).withMessage('Transaction type must be INCOME or EXPENSE'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('transactionDate')
    .notEmpty().withMessage('Transaction date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'])
    .withMessage('Payment method must be CASH, UPI, CARD, BANK_TRANSFER, or OTHER'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Description cannot exceed 255 characters')
];

module.exports = {
  transactionValidator
};
