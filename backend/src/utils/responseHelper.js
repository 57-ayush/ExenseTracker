/**
 * Standard API Response Structure
 */
const successResponse = (res, message = 'Success', data = {}, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  if (meta !== null) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null, sqlDetails = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  if (sqlDetails) {
    response.sqlDetails = sqlDetails;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
