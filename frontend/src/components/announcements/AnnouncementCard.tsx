import { clsx } from 'clsx'
import { Megaphone, AlertTriangle, Zap } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { timeAgo } from '@/utils/formatDate'
import type { Announcement } from '@/types/announcement'

interface AnnouncementCardProps {
  announcement: Announcement
  onClick?: () => void
}

const priorityConfig = {
  normal:    { border: 'border-l-gray-300',   dot: '',                  icon: <Megaphone className="w-4 h-4" /> },
  urgent:    { border: 'border-l-amber-500',  dot: 'bg-amber-500',      icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
  emergency: { border: 'border-l-danger',     dot: 'bg-danger animate-pulse', icon: <Zap className="w-4 h-4 text-danger" /> },
}

export const AnnouncementCard = ({ announcement, onClick }: AnnouncementCardProps) => {
  const config = priorityConfig[announcement.priority]

  return (
    <article
      className={clsx(
        'bg-white rounded-lg p-4 shadow-card border-l-4 cursor-pointer',
        'hover:shadow-md transition-shadow duration-150',
        config.border,
        !announcement.is_read && 'ring-1 ring-primary-100'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={`${announcement.title}${!announcement.is_read ? ' (unread)' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gray-500" aria-hidden="true">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant={announcement.priority === 'emergency' ? 'danger' : announcement.priority === 'urgent' ? 'warning' : 'default'}>
              {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
            </Badge>
            <Badge variant="default">{announcement.category}</Badge>
            {!announcement.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-label="Unread" />
            )}
          </div>
          <h3 className="font-display font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {announcement.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{announcement.body}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{announcement.author.department}</span>
            <span>·</span>
            <span>{timeAgo(announcement.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
