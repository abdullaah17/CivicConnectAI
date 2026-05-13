'use client'

import Link from 'next/link'
import { AlertTriangle, Ticket, Clock, CheckCircle2, BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/analytics/KPICard'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList, SkeletonKPICard } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { useDeptTickets, useTicketStats } from '@/hooks/useTickets'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const deptId = user?.department_id || ''
  const { data: stats, isLoading: statsLoading } = useTicketStats()
  const { data: breachingTickets, isLoading: ticketsLoading } = useDeptTickets(deptId, {
    status: 'In Progress',
    limit: 6,
  })

  return (
    <div>
      <PageHeader
        title="Department Dashboard"
        subtitle="Monitor your department's performance and SLA compliance."
        actions={
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
          >
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
            View Analytics
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <KPICard label="Total Tickets" value={stats?.total ?? 0} icon={<Ticket className="w-5 h-5" />} color="blue" />
            <KPICard label="Open Tickets" value={stats?.open ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
            <KPICard label="Avg Resolution" value={stats?.avg_resolution_hours ?? 0} suffix="h" icon={<Clock className="w-5 h-5" />} color="purple" />
            <KPICard label="SLA Breached" value={stats?.sla_breached ?? 0} icon={<CheckCircle2 className="w-5 h-5" />} color="red" />
          </>
        )}
      </div>

      {/* Active tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-gray-900 text-lg">Active Tickets</h2>
          <Link href="/admin/tickets" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
            View all →
          </Link>
        </div>

        {ticketsLoading ? (
          <SkeletonList count={3} />
        ) : !breachingTickets?.tickets?.length ? (
          <EmptyState
            icon={<Ticket className="w-12 h-12" />}
            title="No active tickets"
            description="All tickets are resolved or closed."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {breachingTickets.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="staff-view" basePath="/admin/tickets" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
