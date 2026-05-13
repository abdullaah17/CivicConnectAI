'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const DATE_RANGES = [
  { value: '7',  label: 'Last 7 days'  },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

const COLOR_MAP: Record<string, string> = {
  Submitted: '#3B82F6', 'Under Review': '#6366F1', Assigned: '#8B5CF6',
  'In Progress': '#F59E0B', Resolved: '#16A34A', Closed: '#6B7280',
}

export default function SuperAdminAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30')

  const dateFrom = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'system', { dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/tickets', { params: { date_from: dateFrom } })
      return data.data
    },
  })

  const { data: topIssues } = useQuery({
    queryKey: ['analytics', 'top-issues', 'system', { dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-issues', { params: { date_from: dateFrom } })
      return data.data
    },
  })

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/analytics/export-csv', {
        params: { date_from: dateFrom },
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-analytics-${dateRange}days.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed.')
    }
  }

  const byStatus: { status: string; count: number }[] = analytics?.by_status ?? []
  const total = byStatus.reduce((s: number, d: { count: number }) => s + d.count, 0)

  return (
    <div>
      <PageHeader
        title="System Analytics"
        subtitle="City-wide performance metrics across all departments."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Analytics' }]}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        }
      />

      <div className="flex gap-2 mb-6">
        {DATE_RANGES.map((r) => (
          <button key={r.value} onClick={() => setDateRange(r.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              dateRange === r.value ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >{r.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-5 shadow-card border border-gray-100 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Tickets',  value: analytics?.total ?? 0,                       bg: '#EFF6FF', text: '#1D4ED8' },
              { label: 'Resolved',        value: analytics?.resolved ?? 0,                    bg: '#F0FDF4', text: '#15803D' },
              { label: 'Avg Resolution',  value: `${analytics?.avg_resolution_hours ?? 0}h`,  bg: '#FAF5FF', text: '#7E22CE' },
              { label: 'SLA Breach Rate', value: `${analytics?.sla_breach_rate ?? 0}%`,       bg: '#FFF1F2', text: '#BE123C' },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-2">{k.label}</p>
                <p className="text-3xl font-bold" style={{ color: k.text }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
            <div className="space-y-3">
              {byStatus.map((d: { status: string; count: number }) => (
                <div key={d.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{d.status}</span>
                    <span className="text-gray-500">{d.count} ({total > 0 ? Math.round(d.count / total * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${total > 0 ? (d.count / total) * 100 : 0}%`, backgroundColor: COLOR_MAP[d.status] ?? '#9CA3AF' }}
                    />
                  </div>
                </div>
              ))}
              {byStatus.length === 0 && <p className="text-sm text-gray-400">No data for this period.</p>}
            </div>
          </div>

          {topIssues && topIssues.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-card border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Top Issues</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">#</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Category</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Department</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topIssues.map((row: { rank: number; category: string; department: string; count: number }) => (
                    <tr key={row.rank} className="border-b border-gray-50">
                      <td className="py-2 px-3 text-gray-400">{row.rank}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{row.category}</td>
                      <td className="py-2 px-3 text-gray-600">{row.department}</td>
                      <td className="py-2 px-3 text-right font-semibold">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
