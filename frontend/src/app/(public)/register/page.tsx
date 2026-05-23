'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { registerSchema, type RegisterFormData } from '@/utils/validators'
import { useRegister } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errorHandler'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegister()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_registeredEmail, setRegisteredEmail] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setRegisteredEmail(data.email)
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`)
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err)
      // Check for duplicate email error
      if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('email')) {
        setError('email', { message: 'An account with this email already exists.' })
      } else {
        toast.error(errorMsg)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow">Create your account</h1>
          <p className="text-white/70 text-sm mt-1">Join CivicConnect and start engaging with your city</p>
        </div>

        <div className="card-glass p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Ayesha Tariq"
              required
              error={errors.name?.message}
              autoComplete="name"
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
              required
              error={errors.password?.message}
              autoComplete="new-password"
              helperText="At least 8 characters with uppercase, number, and special character"
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              required
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full !bg-black !text-[#E1E0CC] hover:!bg-black/80 font-semibold"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E1E0CC] font-medium hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
