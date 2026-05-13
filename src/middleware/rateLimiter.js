const rateLimit = require('express-rate-limit');

const rateLimitMessage = (windowMinutes) => ({
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: `Too many attempts. Please try again in ${windowMinutes} minutes.`,
  },
});

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(15),
  keyGenerator: (req) => req.ip,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(15),
  keyGenerator: (req) => req.ip,
});

module.exports = { authLimiter, otpLimiter };
