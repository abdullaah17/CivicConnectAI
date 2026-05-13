const logger = require('../utils/logger');

/**
 * Global error handler — last middleware in the Express chain.
 * Never exposes stack traces or internal details to the client.
 */
function globalErrorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.path,
    method: req.method,
    userId: req.user?.id,
    requestId: req.id,
  });

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'A record with these details already exists.' },
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      },
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'File exceeds the 10 MB limit.' },
    });
  }

  // Multer unsupported file type
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({
      success: false,
      error: { code: 'UNSUPPORTED_FILE_TYPE', message: 'File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF.' },
    });
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: { code: 'CORS_ERROR', message: err.message },
    });
  }

  // Operational errors (thrown intentionally with statusCode + errorCode)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: { code: err.errorCode || 'BAD_REQUEST', message: err.message },
    });
  }

  // Default — never expose internals
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}

module.exports = globalErrorHandler;
