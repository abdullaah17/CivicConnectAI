import { create } from 'zustand'
import type { Notification } from '@/types/announcement'

interface NotificationState {
  unreadCount: number
  notifications: Notification[]
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: (count?: number) => void
  setNotifications: (notifications: Notification[]) => void
  prependNotification: (notification: Notification) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: (count = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - count) })),

  setNotifications: (notifications) => set({ notifications }),

  prependNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),

  markAllRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })),
}))
