'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList, SkeletonKPICard } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { useStaffQueue, useTicketStats } from '@/hooks/useTickets'
import { Ticket, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function StaffDashboard() {
  const { user } = useAuthStore()
  const { data: queue, isLoading: queueLoading } = useStaffQueue({ limit: 10 })
  const { data: stats, isLoading: statsLoading } = useTicketStats()

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Staff'}`}
        subtitle="Your assigned tickets for today, sorted by SLA urgency."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <StatCard label="Assigned to Me"  value={stats?.open ?? 0}          icon={<Ticket className="w-5 h-5" />} />
            <StatCard label="In Progress"     value={stats?.in_progress ?? 0}   icon={<Clock className="w-5 h-5" />} />
            <StatCard label="Resolved Today"  value={stats?.resolved ?? 0}      icon={<CheckCircle2 className="w-5 h-5" />} />
            <StatCard label="SLA Breached"    value={stats?.sla_breached ?? 0}  icon={<AlertTriangle className="w-5 h-5" />} />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">My Ticket Queue</h2>
          <Link href="/staff/tickets" className="text-sm text-[#E1E0CC]/80 hover:text-[#E1E0CC] transition-colors font-medium">
            View all →
          </Link>
        </div>

        {queueLoading ? (
          <SkeletonList count={4} />
        ) : !queue?.tickets?.length ? (
          <EmptyState
            icon={<Ticket className="w-12 h-12" />}
            title="No tickets assigned"
            description="You're all caught up! No tickets are currently assigned to you."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {queue.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="staff-view" basePath="/staff/tickets" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4 shadow-card border border-white/20"
      style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'black', color: '#E1E0CC' }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
