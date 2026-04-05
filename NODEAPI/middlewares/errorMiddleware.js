/**
 * Global Error Handler Middleware
 * Must be placed after all other route handlers
 * API v1.0+
 */

const errorMiddleware = (err, req, res, next) => {
  // Log error with context
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    statusCode: err.statusCode || 500,
  };

  console.error("ERROR:", JSON.stringify(errorLog, null, 2));

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Build response
  const response = {
    success: false,
    message: err.message || "Internal server error",
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Include validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
