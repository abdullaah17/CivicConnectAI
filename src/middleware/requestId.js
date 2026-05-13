const { randomUUID } = require('crypto');

/**
 * Injects a unique request ID on every incoming request.
 * Used for end-to-end log tracing.
 */
function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}

module.exports = requestId;
