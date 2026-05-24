'use client'

import Link from 'next/link'
import { AlertCircle, Ticket, FileText, Bell } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { TicketCard } from '@/components/tickets/TicketCard'
import { SkeletonList, SkeletonKPICard } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { useMyTickets, useTicketStats } from '@/hooks/useTickets'

export default function ResidentDashboard() {
  const { user } = useAuthStore()
  const { data: ticketsData, isLoading: ticketsLoading } = useMyTickets({ limit: 5 })
  const { data: stats, isLoading: statsLoading } = useTicketStats()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name ? user.name.split(' ')[0] : 'there'}`}
        subtitle="Here's what's happening with your civic requests."
        actions={
          <Link href="/requests/new">
            <Button
              leftIcon={<AlertCircle className="w-4 h-4" />}
              className="!bg-black !text-[#E1E0CC] hover:!bg-black/80"
            >
              Report an Issue
            </Button>
          </Link>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <StatCard label="Total Requests" value={stats?.total ?? 0} icon={<Ticket className="w-5 h-5" />} />
            <StatCard label="Open"           value={stats?.open ?? 0}  icon={<AlertCircle className="w-5 h-5" />} />
            <StatCard label="In Progress"    value={stats?.in_progress ?? 0} icon={<FileText className="w-5 h-5" />} />
            <StatCard label="Resolved"       value={stats?.resolved ?? 0}    icon={<Bell className="w-5 h-5" />} />
          </>
        )}
      </div>

      {/* Recent tickets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">Recent Requests</h2>
          <Link href="/requests" className="text-sm text-[#E1E0CC]/80 hover:text-[#E1E0CC] transition-colors font-medium">
            View all →
          </Link>
        </div>

        {ticketsLoading ? (
          <SkeletonList count={3} />
        ) : !ticketsData?.tickets?.length ? (
          <EmptyState
            icon={<Ticket className="w-12 h-12" />}
            title="No requests yet"
            description="Submit your first civic request and we'll track it for you."
            ctaLabel="Submit Your First Request"
            ctaAction={() => window.location.href = '/requests/new'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ticketsData.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="resident-view" />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/permits',       icon: <FileText className="w-5 h-5" />, label: 'Apply for Permit',   desc: 'Construction, event, or business license' },
          { href: '/announcements', icon: <Bell className="w-5 h-5" />,     label: 'City Announcements', desc: 'Stay informed about city updates' },
          { href: '/events',        icon: <AlertCircle className="w-5 h-5" />, label: 'Upcoming Events', desc: 'Community events and registrations' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg p-4 shadow-card border border-white/20 hover:border-[#E1E0CC]/40 hover:shadow-md transition-all flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
          >
            {/* Black icon box with cream icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'black', color: '#E1E0CC' }}
              aria-hidden="true"
            >
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
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
        {/* Black icon box with cream icon */}
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
