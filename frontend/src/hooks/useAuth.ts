import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/users/me')
      return data.data
    },
    enabled: useAuthStore.getState().isAuthenticated,
  })

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: { identifier: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials)
      return data.data as { accessToken: string; user: User; requires2FA?: boolean }
    },
    onSuccess: (result) => {
      if (result.requires2FA) return // caller handles 2FA modal
      setAuth(result.user, result.accessToken)
      // Route by role
      const role = result.user.role
      if (role === 'staff') router.push('/staff/dashboard')
      else if (role === 'dept_admin') router.push('/admin/dashboard')
      else if (role === 'super_admin') router.push('/superadmin/dashboard')
      else router.push('/dashboard')
    },
  })
}

export const useRegister = () =>
  useMutation({
    mutationFn: async (payload: {
      name: string
      email: string
      password: string
      profile_photo?: File
    }) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) formData.append(k, v as string | Blob)
      })
      const { data } = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })

export const useVerifyOTP = () => {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const { data } = await api.post('/auth/verify-otp', payload)
      return data.data as { accessToken: string; user: User }
    },
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken)
      router.push('/dashboard')
    },
  })
}

export const useResendOTP = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/resend-otp', { email })
      return data
    },
  })

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data
    },
  })

export const useResetPassword = () =>
  useMutation({
    mutationFn: async (payload: { email: string; otp: string; newPassword: string }) => {
      const { data } = await api.post('/auth/reset-password', payload)
      return data
    },
  })
