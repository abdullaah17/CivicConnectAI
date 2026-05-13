'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import OtpInput from 'react-otp-input'
import { Button } from '@/components/common/Button'
import { useVerifyOTP, useResendOTP } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

function OTPForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const verifyMutation = useVerifyOTP()
  const resendMutation = useResendOTP()

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleVerify = async () => {
    if (otp.length !== 6) return
    try {
      await verifyMutation.mutateAsync({ email, otp })
    } catch {
      toast.error('Invalid or expired OTP. Please try again.')
      setOtp('')
    }
  }

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync(email)
      setCooldown(60)
      toast.success('OTP resent to your email.')
    } catch {
      toast.error('Failed to resend OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold font-display text-lg">CC</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 space-y-6">
          <div className="flex justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-11 h-13 mx-1.5 text-center text-xl font-mono-civic border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-700"
                  aria-label="OTP digit"
                />
              )}
            />
          </div>

          <Button
            onClick={handleVerify}
            size="lg"
            loading={verifyMutation.isPending}
            disabled={otp.length !== 6}
            className="w-full"
          >
            Verify Email
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the code?{' '}
              {cooldown > 0 ? (
                <span className="text-gray-400">Resend in {cooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-primary-700 font-medium hover:text-primary-900 transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  )
}
