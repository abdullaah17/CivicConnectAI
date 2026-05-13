import { create } from 'zustand'
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
}

export const useUIStore = create<UIState>((set) => ({
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
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
