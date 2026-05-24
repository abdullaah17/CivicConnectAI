/**
 * Test authentication utilities for development only.
 * Provides mock users so the auth flow can be tested without real backend credentials.
 */

import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

// Mock user data matching the User type exactly
export const mockUsers: Record<string, { user: User; password: string }> = {
  'resident@test.com': {
    user: {
      id: 'test-resident-id',
      name: 'Test Resident',
      email: 'resident@test.com',
      role: 'resident',
      profile_photo_url: undefined,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
    password: 'Test@1234',
  },
  'staff@test.com': {
    user: {
      id: 'test-staff-id',
      name: 'Test Staff',
      email: 'staff@test.com',
      role: 'staff',
      profile_photo_url: undefined,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
    password: 'Test@1234',
  },
  'admin@test.com': {
    user: {
      id: 'test-admin-id',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'dept_admin',
      profile_photo_url: undefined,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
    password: 'Test@1234',
  },
}

/** Mock login — resolves with a fake user + token, rejects on bad credentials. */
export const mockLogin = (
  identifier: string,
  password: string,
): Promise<{ user: User; accessToken: string }> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const entry = mockUsers[identifier.toLowerCase()]
      if (!entry || entry.password !== password) {
        reject(new Error('Invalid credentials'))
        return
      }
      resolve({
        user: entry.user,
        accessToken: `mock-token-${entry.user.id}-${Date.now()}`,
      })
    }, 500)
  })

/** Log current auth state to the browser console (dev helper). */
export const testAuthState = () => {
  const store = useAuthStore.getState()
  console.log('Auth state:', {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    hasToken: !!store.accessToken,
    hasHydrated: store._hasHydrated,
  })

  if (typeof document !== 'undefined') {
    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('civic-auth-signal='))
    console.log('Auth cookie:', cookie ?? 'not set')
  }
}

/** Clear all auth data (dev helper). */
export const clearAuthState = () => {
  useAuthStore.getState().logout()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civic-auth')
  }
}
