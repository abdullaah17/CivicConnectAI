import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sampleUser, shouldUseSampleData } from '@/utils/sampleData'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, accessToken) => {
        // Set a lightweight cookie so middleware can detect auth state
        // (localStorage is not accessible in middleware)
        if (typeof document !== 'undefined') {
          document.cookie = 'civic-auth-signal=1; path=/; SameSite=Lax; max-age=86400'
        }
        set({ user, accessToken, isAuthenticated: true })
      },

      logout: () => {
        // Clear the middleware auth signal cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'civic-auth-signal=; path=/; max-age=0'
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'civic-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Must call set() through the store action — direct mutation does NOT
        // trigger React re-renders, so components would never see _hasHydrated=true.
        state?.setHasHydrated(true)
        
        // Auto-authenticate with sample data if enabled and not already authenticated
        if (shouldUseSampleData() && !state?.isAuthenticated) {
          state?.setAuth(sampleUser, 'sample-token')
        }
        
        // Restore the middleware signal cookie if user is still authenticated
        if (state?.isAuthenticated && typeof document !== 'undefined') {
          document.cookie = 'civic-auth-signal=1; path=/; SameSite=Lax; max-age=86400'
        }
      },
    }
  )
)
