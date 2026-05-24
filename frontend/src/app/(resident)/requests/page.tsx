'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ticket, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Input'
import { useMyTickets } from '@/hooks/useTickets'

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
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Emergency', label: 'Emergency' },
]

export default function MyTicketsPage() {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMyTickets({
    status: status || undefined,
    priority: priority || undefined,
    page,
    limit: 12,
  })

  return (
    <div>
      <PageHeader
        variant="dark"
        title="My Requests"
        subtitle="Track all your submitted civic requests."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Requests' }]}
        actions={
          <Link href="/requests/new">
            <Button leftIcon={<Plus className="w-4 h-4" />} size="sm">
              New Request
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          containerClassName="w-40"
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(v) => { setPriority(v); setPage(1) }}
          containerClassName="w-40"
        />
      </div>

      {isLoading ? (
        <SkeletonList count={6} />
      ) : !data?.tickets?.length ? (
        <EmptyState
          variant="dark"
          icon={<Ticket className="w-12 h-12" />}
          title="No requests found"
          description={status || priority ? 'Try adjusting your filters.' : 'You haven\'t submitted any requests yet.'}
          ctaLabel={!status && !priority ? 'Submit Your First Request' : undefined}
          ctaAction={!status && !priority ? () => window.location.href = '/requests/new' : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {data.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="resident-view" />
            ))}
          </div>

          {/* Pagination */}
          {data.total > 12 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-white/70">
                Page {page} of {Math.ceil(data.total / 12)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / 12)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
