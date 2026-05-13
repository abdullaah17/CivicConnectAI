'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import { Calendar } from 'lucide-react'
import { StatusBadge, PriorityBadge, Badge } from '@/components/common/Badge'
import { SLATimer } from '@/components/common/SLATimer'
import { formatDate } from '@/utils/formatDate'
import type { TicketListItem } from '@/types/ticket'

interface TicketCardProps {
  ticket: TicketListItem
  variant?: 'resident-view' | 'staff-view'
  basePath?: string
}

export const TicketCard = ({
  ticket,
  variant = 'resident-view',
  basePath = '/requests',
}: TicketCardProps) => {
  return (
    <Link
      href={`${basePath}/${ticket.id}`}
      className={clsx(
        'block bg-white rounded-lg p-4 shadow-card border border-gray-100',
        'hover:shadow-md hover:border-primary-100 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700'
      )}
      aria-label={`Ticket ${ticket.ticket_number}: ${ticket.title}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono-civic text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {ticket.ticket_number}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-gray-900 text-base mb-1 line-clamp-2">
        {ticket.title}
      </h3>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
        <Badge variant="default">{ticket.department_name}</Badge>
        <Badge variant="default">{ticket.category}</Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" aria-hidden="true" />
          <span>{formatDate(ticket.created_at)}</span>
        </div>

        <SLATimer deadline={ticket.sla_deadline} size="compact" />
      </div>

      {variant === 'staff-view' && ticket.assigned_to && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          Assigned to: <span className="font-medium text-gray-700">{ticket.assigned_to.name}</span>
        </div>
      )}
    </Link>
  )
}
