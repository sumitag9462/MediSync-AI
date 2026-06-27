const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');
const env = require('../config/env');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose not found error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  // Log the error
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  // Use standardized error response
  return errorResponse(res, statusCode, message, env.NODE_ENV === 'production' ? null : { stack: err.stack });
};

module.exports = { notFound, errorHandler };
