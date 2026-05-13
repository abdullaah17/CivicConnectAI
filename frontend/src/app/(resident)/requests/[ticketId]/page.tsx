'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge, PriorityBadge, Badge } from '@/components/common/Badge'
import { SLATimer } from '@/components/common/SLATimer'
import { StatusTimeline } from '@/components/tickets/StatusTimeline'
import { CommentThread } from '@/components/tickets/CommentThread'
import { AttachmentGallery } from '@/components/tickets/AttachmentGallery'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { useTicket, useAddComment } from '@/hooks/useTickets'
import { formatDateTime } from '@/utils/formatDate'
import { MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const addComment = useAddComment(ticketId)

  const handleAddComment = async (body: string, isInternal: boolean) => {
    try {
      await addComment.mutateAsync({ body, is_internal: isInternal })
    } catch {
      toast.error('Failed to post comment. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Ticket not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={ticket.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Requests', href: '/requests' },
          { label: ticket.ticket_number },
        ]}
      />

      {/* Header card */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono-civic text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {ticket.ticket_number}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <Badge variant="default">{ticket.department_name}</Badge>
          <Badge variant="default">{ticket.category}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span>{ticket.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span>Submitted {formatDateTime(ticket.created_at)}</span>
          </div>
        </div>

        <SLATimer deadline={ticket.sla_deadline} size="full" />
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <h2 className="font-display font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <AttachmentGallery attachments={ticket.attachments} />
        </div>
      )}

      {/* Status timeline */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <h2 className="font-display font-semibold text-gray-900 mb-4">Status History</h2>
        <StatusTimeline history={ticket.status_history} />
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
        <CommentThread
          comments={ticket.comments}
          onAddComment={handleAddComment}
          isSubmitting={addComment.isPending}
        />
      </div>
    </div>
  )
}
