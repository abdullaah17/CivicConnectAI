'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { initializeSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useUIStore } from '@/store/uiStore'
import api from '@/lib/api'
import type { Announcement, Notification } from '@/types/announcement'

// Normalise a raw notification from the backend (same logic as useAnnouncements)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNotification(raw: any): Notification {
  const typeMap: Record<string, Notification['type']> = {
    ticket_status_change:        'status_change',
    ticket_comment:              'status_change',
    ticket_assigned:             'status_change',
    permit_status_change:        'permit_update',
    permit_approved:             'permit_update',
    permit_rejected:             'permit_update',
    announcement_published:      'announcement',
    sla_breach_alert:            'sla_alert',
    event_registration_confirmed:'event',
    status_change:               'status_change',
    sla_alert:                   'sla_alert',
    announcement:                'announcement',
    event:                       'event',
    permit_update:               'permit_update',
  }
  return {
    id:         raw.id,
    type:       typeMap[raw.type] ?? 'status_change',
    title:      raw.title ?? raw.type ?? '',
    message:    raw.message,
    link:       raw.link ?? raw.reference_url,
    is_read:    raw.isRead ?? raw.is_read ?? false,
    created_at: raw.createdAt ?? raw.created_at ?? '',
  }
}

export const useWebSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore()
  const { incrementUnread, prependNotification, setNotifications, setUnreadCount } = useNotificationStore()
  const { showEmergencyBanner } = useUIStore()
  const qc = useQueryClient()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return
    initialized.current = true

    // ── Seed the notification store on mount ─────────────────────────────────
    // Fetch the 20 most recent notifications so the dropdown is populated
    // immediately without waiting for a WebSocket push.
    api.get('/notifications', { params: { limit: 20 } })
      .then(({ data }) => {
        const items: Notification[] = (data.data ?? []).map(normalizeNotification)
        setNotifications(items)
        setUnreadCount(items.filter((n) => !n.is_read).length)
      })
      .catch(() => {
        // Non-critical — dropdown will just be empty until a push arrives
      })

    // ── WebSocket ─────────────────────────────────────────────────────────────
    const socket = initializeSocket(accessToken)

    socket.on('connect', () => {
      // Suppress noisy log in production
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] Connected')
      }
    })

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] Disconnected')
      }
    })

    socket.on('ticket:status_updated', (payload: { ticket_id: string; status: string }) => {
      qc.invalidateQueries({ queryKey: ['tickets', payload.ticket_id] })
      qc.invalidateQueries({ queryKey: ['tickets', 'assigned'] })
      qc.invalidateQueries({ queryKey: ['tickets', 'department'] })
    })

    socket.on('notification:new', (raw: unknown) => {
      const notification = normalizeNotification(raw)
      incrementUnread()
      prependNotification(notification)
    })

    socket.on('announcement:emergency', (announcement: Announcement) => {
      showEmergencyBanner(announcement)
    })

    socket.on('sla:breach_alert', (payload: { ticket_id: string; ticket_number: string }) => {
      toast.error(`SLA breach: Ticket ${payload.ticket_number} has exceeded its deadline.`, { duration: 0 })
      qc.invalidateQueries({ queryKey: ['tickets', 'department'] })
      qc.invalidateQueries({ queryKey: ['analytics', 'tickets'] })
    })

    return () => {
      disconnectSocket()
      initialized.current = false
    }
  }, [isAuthenticated, accessToken, qc, incrementUnread, prependNotification, setNotifications, setUnreadCount, showEmergencyBanner])
}
