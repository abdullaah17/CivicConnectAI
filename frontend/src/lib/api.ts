import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for refresh token cookie
  // Do NOT set a global Content-Type here.
  // - JSON requests: axios sets 'application/json' automatically
  // - FormData requests: axios sets 'multipart/form-data; boundary=...' automatically
  // A global Content-Type default overrides the multipart boundary and breaks file uploads.
})

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 with silent refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    const requestUrl = originalRequest?.url ?? ''
    const isAuthRequest = requestUrl.includes('/auth/')

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest) {
            originalRequest.headers!['Authorization'] = `Bearer ${token}`
          }
          return api(originalRequest!)
        })
      }

      originalRequest!._retry = true
      isRefreshing = true

      try {
        const { data } = await refreshClient.post('/auth/refresh')
        const newToken = data.data.access_token ?? data.data.accessToken
        const currentUser = useAuthStore.getState().user
        if (!currentUser) {
          throw new Error('Cannot refresh session without a current user.')
        }
        useAuthStore.getState().setAuth(currentUser, newToken)
        processQueue(null, newToken)
        originalRequest!.headers!['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest!)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
