const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  // Handle MySQL Specific Errors
  if (err.errno || err.code) {
    // MySQL 1369: CHECK OPTION failed 'view_name'
    if (err.errno === 1369 || err.code === 'ER_VIEW_CHECK_FAILED') {
      return errorResponse(
        res,
        'View CHECK OPTION Constraint Failed: MySQL rejected this mutation because it violates the view WHERE clause criteria (e.g. attempting to assign transaction_type != EXPENSE).',
        400,
        null,
        {
          mysqlCode: err.code,
          mysqlErrno: err.errno,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage,
          sql: err.sql
        }
      );
    }

    // MySQL 1062: Duplicate entry
    if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
      return errorResponse(
        res,
        'Duplicate Entry: A record with this unique value already exists (e.g., email or monthly category budget).',
        409,
        null,
        {
          mysqlCode: err.code,
          mysqlErrno: err.errno,
          sqlMessage: err.sqlMessage
        }
      );
    }

    // MySQL 1451: Cannot delete or update a parent row (foreign key fails)
    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return errorResponse(
        res,
        'Referential Integrity Violation: Cannot delete or update this record because other records (such as transactions or budgets) still reference it.',
        400,
        null,
        {
          mysqlCode: err.code,
          mysqlErrno: err.errno,
          sqlMessage: err.sqlMessage
        }
      );
    }

    // MySQL 1452: Cannot add or update a child row (foreign key doesn't exist)
    if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
      return errorResponse(
        res,
        'Foreign Key Reference Error: The referenced user or category ID does not exist in the database.',
        400,
        null,
        {
          mysqlCode: err.code,
          mysqlErrno: err.errno,
          sqlMessage: err.sqlMessage
        }
      );
    }

    // MySQL 3819: Check constraint violated
    if (err.errno === 3819 || err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
      return errorResponse(
        res,
        'Check Constraint Violated: Value fails database validation rules (e.g. amount must be strictly greater than 0).',
        400,
        null,
        {
          mysqlCode: err.code,
          mysqlErrno: err.errno,
          sqlMessage: err.sqlMessage
        }
      );
    }
  }

  // Handle generic error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
