'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Ticket, Users, Building2, AlertTriangle, BarChart2, Radio } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/analytics/KPICard'
import { SkeletonKPICard } from '@/components/common/SkeletonLoader'
import api from '@/lib/api'

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/tickets/stats')
      return data.data
    },
  })

  return (
    <div>
      <PageHeader
        variant="dark"
        title="System Overview"
        subtitle="City-wide civic services performance at a glance."
        actions={
          <Link
            href="/superadmin/broadcast"
            className="inline-flex items-center gap-2 bg-black text-[#E1E0CC] px-4 py-2 rounded text-sm font-medium hover:bg-black/80 transition-colors min-h-[44px]"
          >
            <Radio className="w-4 h-4" aria-hidden="true" />
            Emergency Broadcast
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <KPICard label="Total Tickets" value={stats?.total ?? 0}        icon={<Ticket className="w-5 h-5" />} />
            <KPICard label="Open Tickets"  value={stats?.open ?? 0}         icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard label="SLA Breached"  value={stats?.sla_breached ?? 0} icon={<AlertTriangle className="w-5 h-5" />} />
            <KPICard label="Resolved"      value={stats?.resolved ?? 0}     icon={<Ticket className="w-5 h-5" />} />
          </>
        )}
      </div>

      <h2 className="font-semibold text-white text-lg mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/superadmin/departments', icon: <Building2 className="w-6 h-6" />, label: 'Departments',        desc: 'Manage department config and SLA defaults' },
          { href: '/superadmin/users',       icon: <Users className="w-6 h-6" />,     label: 'User Management',    desc: 'All users across all roles' },
          { href: '/superadmin/analytics',   icon: <BarChart2 className="w-6 h-6" />, label: 'System Analytics',   desc: 'City-wide performance metrics' },
          { href: '/superadmin/reports',     icon: <Ticket className="w-6 h-6" />,    label: 'Reports',            desc: 'Generate and export system reports' },
          { href: '/superadmin/broadcast',   icon: <Radio className="w-6 h-6" />,     label: 'Emergency Broadcast',desc: 'Send city-wide emergency alerts' },
          { href: '/superadmin/audit',       icon: <AlertTriangle className="w-6 h-6" />, label: 'Audit Logs',     desc: 'All admin actions with timestamps' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg p-5 shadow-card border border-white/20 hover:border-[#E1E0CC]/40 hover:shadow-md transition-all flex items-start gap-3"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'black', color: '#E1E0CC' }}
              aria-hidden="true"
            >
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
