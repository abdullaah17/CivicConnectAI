const { z } = require('zod');

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .email('Invalid email address')
      .transform((s) => s.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        'Password must contain at least one uppercase letter, one number, and one special character'
      ),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const verifyOtpSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform((s) => s.toLowerCase()),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const verify2faSchema = z.object({
  temp_token: z.string().min(1, 'Temporary token is required'),
  totp_code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d+$/, 'TOTP must be numeric'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform((s) => s.toLowerCase()),
});

const resetPasswordSchema = z
  .object({
    email: z.string().email().transform((s) => s.toLowerCase()),
    otp: z.string().length(6).regex(/^\d+$/),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

module.exports = {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  verify2faSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
