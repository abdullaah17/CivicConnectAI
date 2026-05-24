import { clsx } from 'clsx'
import type { TicketStatus, TicketPriority } from '@/types/ticket'

// Status badge
const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  'Submitted':    { label: 'Submitted',    className: 'bg-blue-100 text-blue-700' },
  'Under Review': { label: 'Under Review', className: 'bg-indigo-100 text-indigo-700' },
  'Assigned':     { label: 'Assigned',     className: 'bg-purple-100 text-purple-700' },
  'In Progress':  { label: 'In Progress',  className: 'bg-amber-100 text-amber-700' },
  'Resolved':     { label: 'Resolved',     className: 'bg-success-bg text-success' },
  'Closed':       { label: 'Closed',       className: 'bg-gray-100 text-gray-600' },
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low:       { label: 'Low',       className: 'bg-gray-100 text-gray-600' },
  medium:    { label: 'Medium',    className: 'bg-blue-100 text-blue-700' },
  high:      { label: 'High',      className: 'bg-amber-100 text-amber-700' },
  emergency: { label: 'Emergency', className: 'bg-danger-bg text-danger' },
}

interface StatusBadgeProps {
  status: TicketStatus
  className?: string
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-display',
        config.className,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-display',
        config.className,
        className
      )}
      aria-label={`Priority: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

// Generic badge
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const badgeVariants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-bg text-success',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-danger-bg text-danger',
  info:    'bg-info-bg text-info',
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-display',
      badgeVariants[variant],
      className
    )}
  >
    {children}
  </span>
)
