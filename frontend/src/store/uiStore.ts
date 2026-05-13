import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Announcement } from '@/types/announcement'

interface UIState {
  emergencyBanner: {
    visible: boolean
    announcement: Announcement | null
  }
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  showEmergencyBanner: (announcement: Announcement) => void
  dismissEmergencyBanner: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      emergencyBanner: { visible: false, announcement: null },
      sidebarOpen: false,
      theme: 'light',

      showEmergencyBanner: (announcement) =>
        set({ emergencyBanner: { visible: true, announcement } }),

      dismissEmergencyBanner: () =>
        set({ emergencyBanner: { visible: false, announcement: null } }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        }),

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'civic-ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme)
      },
    }
  )
)
