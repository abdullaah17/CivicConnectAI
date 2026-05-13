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
        title="System Overview"
        subtitle="City-wide civic services performance at a glance."
        actions={
          <Link
            href="/superadmin/broadcast"
            className="inline-flex items-center gap-2 bg-danger text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px]"
          >
            <Radio className="w-4 h-4" aria-hidden="true" />
            Emergency Broadcast
          </Link>
        }
      />

      {/* System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <KPICard label="Total Tickets" value={stats?.total ?? 0} icon={<Ticket className="w-5 h-5" />} color="blue" />
            <KPICard label="Open Tickets" value={stats?.open ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
            <KPICard label="SLA Breached" value={stats?.sla_breached ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
            <KPICard label="Resolved" value={stats?.resolved ?? 0} icon={<Ticket className="w-5 h-5" />} color="green" />
          </>
        )}
      </div>

      {/* Quick navigation */}
      <h2 className="font-display font-semibold text-gray-900 text-lg mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/superadmin/departments', icon: <Building2 className="w-6 h-6" />, label: 'Departments', desc: 'Manage department config and SLA defaults' },
          { href: '/superadmin/users', icon: <Users className="w-6 h-6" />, label: 'User Management', desc: 'All users across all roles' },
          { href: '/superadmin/analytics', icon: <BarChart2 className="w-6 h-6" />, label: 'System Analytics', desc: 'City-wide performance metrics' },
          { href: '/superadmin/reports', icon: <Ticket className="w-6 h-6" />, label: 'Reports', desc: 'Generate and export system reports' },
          { href: '/superadmin/broadcast', icon: <Radio className="w-6 h-6" />, label: 'Emergency Broadcast', desc: 'Send city-wide emergency alerts' },
          { href: '/superadmin/audit', icon: <AlertTriangle className="w-6 h-6" />, label: 'Audit Logs', desc: 'All admin actions with timestamps' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-lg p-5 shadow-card border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all flex items-start gap-3"
          >
            <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              {item.icon}
            </div>
            <div>
              <p className="font-display font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
