/**
 * Test authentication utilities for development
 * This file helps test the authentication flow without needing real backend credentials
 */

import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

// Mock user data for testing
export const mockUsers: Record<string, { user: User; password: string }> = {
  'resident@test.com': {
    user: {
      id: 'test-resident-id',
      name: 'Test Resident',
      email: 'resident@test.com',
      role: 'resident',
      profile_photo: null,
      phone: '+1234567890',
      address: '123 Test Street, Test City',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    password: 'Test@1234'
  },
  'staff@test.com': {
    user: {
      id: 'test-staff-id',
      name: 'Test Staff',
      email: 'staff@test.com',
      role: 'staff',
      profile_photo: null,
      phone: '+1234567891',
      address: '456 Staff Avenue, Test City',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    password: 'Test@1234'
  },
  'admin@test.com': {
    user: {
      id: 'test-admin-id',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'dept_admin',
      profile_photo: null,
      phone: '+1234567892',
      address: '789 Admin Boulevard, Test City',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    password: 'Test@1234'
  }
}

/**
 * Mock login function for testing
 */
export const mockLogin = (identifier: string, password: string): Promise<{ user: User; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userData = mockUsers[identifier.toLowerCase()]
      
      if (!userData || userData.password !== password) {
        reject(new Error('Invalid credentials'))
        return
      }

      resolve({
        user: userData.user,
        accessToken: `mock-token-${userData.user.id}-${Date.now()}`
      })
    }, 500) // Simulate network delay
  })
}

/**
 * Test authentication state
 */
export const testAuthState = () => {
  const store = useAuthStore.getState()
  console.log('Current auth state:', {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    hasToken: !!store.accessToken,
    hasHydrated: store._hasHydrated
  })
  
  // Check if cookie exists
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    console.log('Auth cookie:', cookies['civic-auth-signal'])
  }
}

/**
 * Clear all authentication data (for testing)
 */
export const clearAuthState = () => {
  const { logout } = useAuthStore.getState()
  logout()
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civic-auth')
  }
  
  console.log('Auth state cleared')
}