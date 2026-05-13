'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Clock, Megaphone, Calendar, FileText, CheckCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { timeAgo } from '@/utils/formatDate'
import { useNotificationStore } from '@/store/notificationStore'
import api from '@/lib/api'
import type { Notification } from '@/types/announcement'

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  status_change:  <Ticket className="w-4 h-4 text-primary-500" />,
  sla_alert:      <Clock className="w-4 h-4 text-amber-500" />,
  announcement:   <Megaphone className="w-4 h-4 text-info" />,
  event:          <Calendar className="w-4 h-4 text-success" />,
  permit_update:  <FileText className="w-4 h-4 text-purple-500" />,
}

interface NotificationDropdownProps {
  onClose: () => void
}

export const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const router = useRouter()
  const { notifications, markAllRead, markRead } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      markAllRead()
    } catch {
      // ignore
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`)
        markRead(notif.id)
      } catch {
        // ignore
      }
    }
    if (notif.link) {
      router.push(notif.link)
    }
    onClose()
  }

  const recent = notifications.slice(0, 10)

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
      role="region"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-display font-semibold text-sm text-gray-900">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 transition-colors"
          aria-label="Mark all notifications as read"
        >
          <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Mark all read
        </button>
      </div>

      {/* List */}
      <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50" role="list">
        {recent.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-gray-400">
            No notifications yet
          </li>
        )}
        {recent.map((notif) => (
          <li key={notif.id}>
            <button
              onClick={() => handleNotificationClick(notif)}
              className={clsx(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                !notif.is_read && 'bg-primary-50'
              )}
            >
              <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
                {typeIcons[notif.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm text-gray-800 line-clamp-2', !notif.is_read && 'font-medium')}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" aria-label="Unread" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  )
}
