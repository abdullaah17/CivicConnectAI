'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge, PriorityBadge, Badge } from '@/components/common/Badge'
import { SLATimer } from '@/components/common/SLATimer'
import { StatusTimeline } from '@/components/tickets/StatusTimeline'
import { CommentThread } from '@/components/tickets/CommentThread'
import { AttachmentGallery } from '@/components/tickets/AttachmentGallery'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { useTicket, useUpdateTicketStatus, useAddComment } from '@/hooks/useTickets'
import { formatDateTime } from '@/utils/formatDate'
import { MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import type { TicketStatus } from '@/types/ticket'

const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  'Submitted':    ['Under Review'],
  'Under Review': ['Assigned'],
  'Assigned':     ['In Progress'],
  'In Progress':  ['Resolved'],
  'Resolved':     ['Closed'],
  'Closed':       [],
}

export default function StaffTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const updateStatus = useUpdateTicketStatus(ticketId)
  const addComment = useAddComment(ticketId)
  const [newStatus, setNewStatus] = useState('')
  const [publicNote, setPublicNote] = useState('')

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    try {
      await updateStatus.mutateAsync({ status: newStatus, public_note: publicNote || undefined })
      toast.success(`Status updated to ${newStatus}`)
      setNewStatus('')
      setPublicNote('')
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleAddComment = async (body: string, isInternal: boolean) => {
    try {
      await addComment.mutateAsync({ body, is_internal: isInternal })
    } catch {
      toast.error('Failed to post comment.')
    }
  }

  if (isLoading) return <div className="max-w-3xl space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (!ticket) return <div className="text-center py-16"><p className="text-gray-500">Ticket not found.</p></div>

  const nextStatuses = STATUS_TRANSITIONS[ticket.status] || []

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={ticket.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff/dashboard' },
          { label: 'My Queue', href: '/staff/tickets' },
          { label: ticket.ticket_number },
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono-civic text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{ticket.ticket_number}</span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <Badge variant="default">{ticket.department_name}</Badge>
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
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          <span className="font-medium">Submitted by:</span> {ticket.submitted_by.name} ({ticket.submitted_by.email})
        </div>
      </div>

      {/* Status update (staff action) */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <h2 className="font-display font-semibold text-gray-900 mb-3">Update Status</h2>
          <div className="space-y-3">
            <Select
              label="New Status"
              options={[{ value: '', label: 'Select new status...' }, ...nextStatuses.map((s) => ({ value: s, label: s }))]}
              value={newStatus}
              onChange={setNewStatus}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 font-display block mb-1">
                Public Note (optional)
              </label>
              <textarea
                value={publicNote}
                onChange={(e) => setPublicNote(e.target.value)}
                placeholder="Add a note visible to the resident..."
                className="w-full px-3 py-2 rounded-sm border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[80px]"
                maxLength={500}
              />
            </div>
            <Button
              onClick={handleStatusUpdate}
              loading={updateStatus.isPending}
              disabled={!newStatus}
              size="sm"
            >
              Update Status
            </Button>
          </div>
        </div>
      )}

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <AttachmentGallery attachments={ticket.attachments} />
        </div>
      )}

      {/* Timeline */}
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
