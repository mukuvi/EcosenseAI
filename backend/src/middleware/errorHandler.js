const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 */
function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack });

  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
