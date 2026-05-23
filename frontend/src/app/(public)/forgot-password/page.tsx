'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import OtpInput from 'react-otp-input'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useForgotPassword, useResetPassword } from '@/hooks/useAuth'
import { emailSchema, passwordSchema } from '@/utils/validators'
import { getErrorMessage } from '@/lib/errorHandler'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'reset'

const emailFormSchema = z.object({ email: emailSchema })
const resetFormSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  const forgotMutation = useForgotPassword()
  const resetMutation = useResetPassword()

  const emailForm = useForm({ resolver: zodResolver(emailFormSchema) })
  const resetForm = useForm({ resolver: zodResolver(resetFormSchema) })

  const handleEmailSubmit = async (data: { email: string }) => {
    try {
      await forgotMutation.mutateAsync(data.email)
      setEmail(data.email)
      setStep('otp')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to send reset code. Please check your email and try again.'))
    }
  }

  const handleOTPNext = () => {
    if (otp.length === 6) setStep('reset')
  }

  const handleReset = async (data: { newPassword: string }) => {
    try {
      await resetMutation.mutateAsync({ email, otp, newPassword: data.newPassword })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err)
      if (errorMsg.toLowerCase().includes('expired')) {
        toast.error('Reset code has expired. Please request a new one.')
        setStep('email')
      } else {
        toast.error(errorMsg)
        setStep('otp')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow">Reset your password</h1>
        </div>

        <div className="card-glass p-6">
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate className="space-y-4">
              <p className="text-sm text-gray-600">Enter your email and we&apos;ll send you a reset code.</p>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />
              <Button type="submit" size="lg" loading={emailForm.formState.isSubmitting} className="w-full">
                Send Reset Code
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              <div className="flex justify-center">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-11 h-13 mx-1.5 text-center text-xl font-mono-civic border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-700"
                    />
                  )}
                />
              </div>
              <Button onClick={handleOTPNext} size="lg" disabled={otp.length !== 6} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} noValidate className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                error={resetForm.formState.errors.newPassword?.message}
                {...resetForm.register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register('confirmPassword')}
              />
              <Button type="submit" size="lg" loading={resetForm.formState.isSubmitting} className="w-full">
                Reset Password
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/login" className="text-primary-700 hover:text-primary-900 transition-colors">
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
