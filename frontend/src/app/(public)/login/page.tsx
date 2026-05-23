'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { loginSchema, type LoginFormData } from '@/utils/validators'
import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { getErrorMessage, isRateLimitError } from '@/lib/errorHandler'
import OtpInput from 'react-otp-input'
import toast from 'react-hot-toast'
import type { User } from '@/types/user'

export default function LoginPage() {
  const { login: loginMutation } = { login: useLogin() }
  const { setAuth } = useAuthStore()
  const [show2FA, setShow2FA] = useState(false)
  const [totp, setTotp] = useState('')
  const [totpLoading, setTotpLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data)
      if (result?.requires2FA) {
        setShow2FA(true)
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        toast.error(getErrorMessage(err, 'Too many attempts. Please wait a moment and try again.'))
      } else {
        // Check if it's an invalid credentials error
        const errorMsg = getErrorMessage(err)
        if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('credentials')) {
          setError('password', { message: 'Invalid credentials. Please try again.' })
        } else {
          toast.error(errorMsg)
        }
      }
    }
  }

  const handle2FAVerify = async () => {
    if (totp.length !== 6) return
    setTotpLoading(true)
    try {
      const { data } = await api.post('/auth/2fa/verify', { totp_code: totp })
      setAuth(data.data.user as User, data.data.accessToken)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Invalid 2FA code. Please try again.'))
    } finally {
      setTotpLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow">Welcome back</h1>
          <p className="text-white/70 text-sm mt-1">Sign in to your CivicConnect account</p>
        </div>

        <div className="card-glass p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email or Staff ID"
              type="text"
              placeholder="you@example.com or STAFF001"
              required
              error={errors.identifier?.message}
              autoComplete="username"
              {...register('identifier')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              required
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[#E1E0CC]/70 hover:text-[#E1E0CC] transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full !bg-black !text-[#E1E0CC] hover:!bg-black/80 font-semibold"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#E1E0CC] font-medium hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* 2FA Modal */}
      <Modal
        open={show2FA}
        onClose={() => setShow2FA(false)}
        title="Two-Factor Authentication"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>
          <div className="flex justify-center">
            <OtpInput
              value={totp}
              onChange={setTotp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-10 h-12 mx-1 text-center text-lg font-mono-civic border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-700"
                />
              )}
            />
          </div>
          <Button
            onClick={handle2FAVerify}
            loading={totpLoading}
            disabled={totp.length !== 6}
            className="w-full"
          >
            Verify
          </Button>
        </div>
      </Modal>
    </div>
  )
}
