import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { normalizeUser } from '@/lib/normalizers'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/users/me')
      return normalizeUser(data.data)
    },
    enabled: useAuthStore.getState().isAuthenticated,
  })

export const useLogin = () => {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: { identifier: string; password: string; redirectTo?: string }) => {
      const { redirectTo, ...loginPayload } = credentials
      const { data } = await api.post('/auth/login', loginPayload)
      const raw = data.data
      return {
        accessToken: raw.access_token ?? raw.accessToken,
        requires2FA: raw.requires2FA ?? raw.requires_2fa ?? false,
        tempToken: raw.temp_token ?? raw.tempToken,
        redirectTo,
        user: raw.user ? normalizeUser(raw.user) : undefined,
      } as { accessToken?: string; user?: User; requires2FA?: boolean; tempToken?: string; redirectTo?: string }
    },
    onSuccess: (result) => {
      if (result.requires2FA) return // caller handles 2FA modal
      if (!result.user || !result.accessToken) return

      const user = result.user
      setAuth(user, result.accessToken)

      // Small delay to ensure auth state and cookie are set before navigation.
      // Use window.location.href (hard nav) so the cookie is guaranteed to be
      // present before the next request hits middleware.
      setTimeout(() => {
        const dest = result.redirectTo
          ?? (user.role === 'staff'       ? '/staff/dashboard'
            : user.role === 'dept_admin'  ? '/admin/dashboard'
            : user.role === 'super_admin' ? '/superadmin/dashboard'
            : '/dashboard')
        window.location.href = dest
      }, 100)
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

  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const { data } = await api.post('/auth/verify-otp', payload)
      const raw = data.data
      return {
        accessToken: raw.access_token ?? raw.accessToken,
        user: normalizeUser(raw.user),
      } as { accessToken: string; user: User }
    },
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken)
      window.location.href = '/dashboard'
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
