'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge, PriorityBadge, Badge } from '@/components/common/Badge'
import { SLATimer } from '@/components/common/SLATimer'
import { StatusTimeline } from '@/components/tickets/StatusTimeline'
import { CommentThread } from '@/components/tickets/CommentThread'
import { AttachmentGallery } from '@/components/tickets/AttachmentGallery'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { useTicket, useUpdateTicketStatus, useAddComment, useAssignTicket } from '@/hooks/useTickets'
import { formatDateTime } from '@/utils/formatDate'
import { MapPin, Calendar, UserCheck } from 'lucide-react'
import api from '@/lib/api'
import { normalizeUser } from '@/lib/normalizers'
import toast from 'react-hot-toast'
import type { User } from '@/types/user'
import type { TicketStatus } from '@/types/ticket'

const ALL_STATUSES: TicketStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed']

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: ticket, isLoading } = useTicket(ticketId)
  const updateStatus = useUpdateTicketStatus(ticketId)
  const addComment = useAddComment(ticketId)
  const assignTicket = useAssignTicket(ticketId)

  const [newStatus, setNewStatus] = useState('')
  const [publicNote, setPublicNote] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')

  const { data: staffList } = useQuery({
    queryKey: ['staff', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { role: 'staff' } })
      return (data.data as User[]).map(normalizeUser)
    },
  })

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

  const handleAssign = async () => {
    if (!selectedStaff) return
    try {
      await assignTicket.mutateAsync(selectedStaff)
      toast.success('Ticket reassigned.')
      setSelectedStaff('')
    } catch {
      toast.error('Failed to reassign ticket.')
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

  const staffOptions = [
    { value: '', label: 'Select staff member...' },
    ...(staffList || []).map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={ticket.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Tickets', href: '/admin/tickets' },
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
        <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
          <span className="font-medium">Submitted by:</span> {ticket.submitted_by?.name} ({ticket.submitted_by?.email})
        </div>
        {ticket.assigned_to && (
          <div className="mt-1 text-sm text-gray-600">
            <span className="font-medium">Assigned to:</span> {ticket.assigned_to.name}
          </div>
        )}
      </div>

      {/* Admin controls */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4 space-y-4">
        <h2 className="font-semibold text-gray-900">Admin Controls</h2>

        {/* Reassign */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" aria-hidden="true" /> Reassign Ticket
          </p>
          <div className="flex gap-2">
            <Select
              options={staffOptions}
              value={selectedStaff}
              onChange={setSelectedStaff}
              containerClassName="flex-1"
            />
            <Button size="sm" onClick={handleAssign} loading={assignTicket.isPending} disabled={!selectedStaff}>
              Assign
            </Button>
          </div>
        </div>

        {/* Status update */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
          <div className="space-y-2">
            <Select
              options={[{ value: '', label: 'Select new status...' }, ...ALL_STATUSES.map((s) => ({ value: s, label: s }))]}
              value={newStatus}
              onChange={setNewStatus}
            />
            <textarea
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              placeholder="Public note (optional)..."
              className="w-full px-3 py-2 rounded-sm border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[80px]"
              maxLength={500}
            />
            <Button size="sm" onClick={handleStatusUpdate} loading={updateStatus.isPending} disabled={!newStatus}>
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {(ticket.attachments?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <AttachmentGallery attachments={ticket.attachments} />
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
        <StatusTimeline history={ticket.status_history} />
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
        <CommentThread comments={ticket.comments} onAddComment={handleAddComment} isSubmitting={addComment.isPending} />
      </div>
    </div>
  )
}
