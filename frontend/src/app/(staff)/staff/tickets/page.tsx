'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Input'
import { useStaffQueue } from '@/hooks/useTickets'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Under Review', label: 'Under Review' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

export default function StaffTicketQueuePage() {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const { data, isLoading } = useStaffQueue({
    status: status || undefined,
    priority: priority || undefined,
  })

  return (
    <div>
      <PageHeader
        title="My Queue"
        subtitle="All tickets assigned to you."
        breadcrumbs={[{ label: 'Dashboard', href: '/staff/dashboard' }, { label: 'My Queue' }]}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} containerClassName="w-40" />
        <Select options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} containerClassName="w-40" />
      </div>

      {isLoading ? (
        <SkeletonList count={6} />
      ) : !data?.tickets?.length ? (
        <EmptyState
          icon={<Ticket className="w-12 h-12" />}
          title="No tickets found"
          description="No tickets match your current filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} variant="staff-view" basePath="/staff/tickets" />
          ))}
        </div>
      )}
    </div>
  )
}
