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

// Safe DOM apply — only called from browser context (never during SSR/hydration)
export const applyThemeToDom = (theme: 'light' | 'dark') => {
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

      // Only update store state — ThemeSync handles DOM
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'civic-ui',
      // Only persist theme
      partialize: (state) => ({ theme: state.theme }),
      // NO onRehydrateStorage — that was causing the hydration crash
    }
  )
)
