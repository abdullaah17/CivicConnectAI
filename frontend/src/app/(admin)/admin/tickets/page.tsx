'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useDeptTickets } from '@/hooks/useTickets'
import { useAuthStore } from '@/store/authStore'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

export default function AdminTicketsPage() {
  const { user } = useAuthStore()
  const deptId = user?.department_id || ''
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useDeptTickets(deptId, {
    status: status || undefined,
    priority: priority || undefined,
    page,
    limit: 12,
  })

  return (
    <div>
      <PageHeader
        title="All Department Tickets"
        subtitle="View and manage all tickets in your department."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Tickets' }]}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Select options={STATUS_OPTIONS} value={status} onChange={(v) => { setStatus(v); setPage(1) }} containerClassName="w-44" />
        <Select options={PRIORITY_OPTIONS} value={priority} onChange={(v) => { setPriority(v); setPage(1) }} containerClassName="w-40" />
      </div>

      {isLoading ? (
        <SkeletonList count={6} />
      ) : !data?.tickets?.length ? (
        <EmptyState icon={<Ticket className="w-12 h-12" />} title="No tickets found" description="No tickets match your current filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {data.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="staff-view" basePath="/admin/tickets" />
            ))}
          </div>
          {data.total > 12 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(data.total / 12)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / 12)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
