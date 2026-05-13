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
      const status = (err as { response?: { status?: number; data?: { error?: { message?: string } } } })?.response?.status
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
      if (status === 409) {
        setError('email', { message: 'An account with this email already exists.' })
      } else {
        toast.error(message || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold font-display text-lg">CC</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join CivicConnect and start engaging with your city</p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
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

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-700 font-medium hover:text-primary-900 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
