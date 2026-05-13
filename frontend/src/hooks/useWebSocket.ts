'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { initializeSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useUIStore } from '@/store/uiStore'
import type { Announcement, Notification } from '@/types/announcement'

export const useWebSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore()
  const { incrementUnread, prependNotification } = useNotificationStore()
  const { showEmergencyBanner } = useUIStore()
  const qc = useQueryClient()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return
    initialized.current = true

    const socket = initializeSocket(accessToken)

    socket.on('connect', () => {
      console.log('[WS] Connected')
    })

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected')
    })

    socket.on('ticket:status_updated', (payload: { ticket_id: string; status: string }) => {
      qc.invalidateQueries({ queryKey: ['tickets', payload.ticket_id] })
      qc.invalidateQueries({ queryKey: ['tickets', 'assigned'] })
      toast.success(`Ticket status updated to ${payload.status}`)
    })

    socket.on('notification:new', (notification: Notification) => {
      incrementUnread()
      prependNotification(notification)
    })

    socket.on('announcement:emergency', (announcement: Announcement) => {
      showEmergencyBanner(announcement)
    })

    socket.on('sla:breach_alert', (payload: { ticket_id: string; ticket_number: string }) => {
      toast.error(`SLA breach alert: Ticket ${payload.ticket_number}`, { duration: 0 })
      qc.invalidateQueries({ queryKey: ['tickets', 'department'] })
    })

    return () => {
      disconnectSocket()
      initialized.current = false
    }
  }, [isAuthenticated, accessToken, qc, incrementUnread, prependNotification, showEmergencyBanner])
}
