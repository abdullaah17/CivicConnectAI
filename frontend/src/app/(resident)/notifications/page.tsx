'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { Ticket, Clock, Megaphone, Calendar, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useNotifications } from '@/hooks/useAnnouncements'
import { useNotificationStore } from '@/store/notificationStore'
import { timeAgo } from '@/utils/formatDate'
import { clsx } from 'clsx'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Notification } from '@/types/announcement'

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  status_change:  <Ticket className="w-4 h-4 text-primary-500" />,
  sla_alert:      <Clock className="w-4 h-4 text-amber-500" />,
  announcement:   <Megaphone className="w-4 h-4 text-info" />,
  event:          <Calendar className="w-4 h-4 text-success" />,
  permit_update:  <FileText className="w-4 h-4 text-purple-500" />,
}

export default function NotificationsPage() {
  const router = useRouter()
  const { data: notifications, isLoading } = useNotifications({ limit: 50 })
  const { markAllRead } = useNotificationStore()

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      markAllRead()
      toast.success('All notifications marked as read.')
    } catch {
      toast.error('Failed to mark notifications as read.')
    }
  }

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`)
      } catch {
        // ignore
      }
    }
    if (notif.link) router.push(notif.link)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Your full notification history."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
        actions={
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark all read
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonList count={5} />
      ) : !notifications?.length ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="No notifications yet"
          description="You'll see updates about your tickets, permits, and announcements here."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 divide-y divide-gray-50" aria-live="polite">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={clsx(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                !notif.is_read && 'bg-primary-50'
              )}
            >
              <span className="mt-0.5 flex-shrink-0" aria-hidden="true">{typeIcons[notif.type]}</span>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm text-gray-800', !notif.is_read && 'font-medium')}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" aria-label="Unread" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
