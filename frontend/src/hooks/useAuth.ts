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
      const raw = data.data
      // Normalize snake_case → camelCase from backend
      return {
        accessToken: raw.access_token ?? raw.accessToken,
        requires2FA: raw.requires2FA ?? raw.requires_2fa ?? false,
        user: {
          ...raw.user,
          name: raw.user?.full_name ?? raw.user?.name,
        },
      } as { accessToken: string; user: User; requires2FA?: boolean }
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
      // Backend expects JSON, not multipart
      const { data } = await api.post('/auth/register', {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        confirm_password: payload.password,
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
      const raw = data.data
      return {
        accessToken: raw.access_token ?? raw.accessToken,
        user: { ...raw.user, name: raw.user?.full_name ?? raw.user?.name },
      } as { accessToken: string; user: User }
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
