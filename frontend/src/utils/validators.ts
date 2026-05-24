import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase())

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must be numeric only')

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name must be at most 80 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

// Auth schemas
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Staff ID is required'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Ticket schema
export const ticketSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must be at most 150 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  department_id: z.string().min(1, 'Please select a department'),
  category: z.string().min(1, 'Please select a category'),
  location: z
    .string()
    .min(5, 'Location must be at least 5 characters')
    .max(300, 'Location must be at most 300 characters'),
  priority: z.enum(['low', 'medium', 'high', 'emergency'], {
    required_error: 'Please select a priority',
  }),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type TicketFormData = z.infer<typeof ticketSchema>
