const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { registerSchema, verifyOtpSchema, resendOtpSchema, loginSchema, verify2faSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/auth.schema');

router.post('/register',        authLimiter, validate(registerSchema),        asyncHandler(ctrl.register));
router.post('/verify-otp',      authLimiter, validate(verifyOtpSchema),       asyncHandler(ctrl.verifyOtp));
router.post('/resend-otp',      otpLimiter,  validate(resendOtpSchema),       asyncHandler(ctrl.resendOtp));
router.post('/login',           authLimiter, validate(loginSchema),           asyncHandler(ctrl.login));
router.post('/2fa/setup',       authenticate, authorize(['dept_admin','super_admin']), asyncHandler(ctrl.setup2fa));
router.post('/2fa/verify',      authLimiter, validate(verify2faSchema),       asyncHandler(ctrl.verify2fa));
router.post('/refresh',                                                        asyncHandler(ctrl.refresh));
router.post('/logout',          authenticate,                                  asyncHandler(ctrl.logout));
router.post('/forgot-password', otpLimiter,  validate(forgotPasswordSchema),  asyncHandler(ctrl.forgotPassword));
router.post('/reset-password',  authLimiter, validate(resetPasswordSchema),   asyncHandler(ctrl.resetPassword));

module.exports = router;
