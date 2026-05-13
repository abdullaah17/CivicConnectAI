'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/analytics/KPICard'
import { TicketStatusDonutChart } from '@/components/analytics/TicketStatusDonutChart'
import { ResolutionTimeLineChart } from '@/components/analytics/ResolutionTimeLineChart'
import { TopIssuesTable } from '@/components/analytics/TopIssuesTable'
import { ComplaintHeatmap } from '@/components/analytics/ComplaintHeatmap'
import { Button } from '@/components/common/Button'
import { SkeletonChart, SkeletonKPICard } from '@/components/common/SkeletonLoader'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const DATE_RANGES = [
  { value: '7',  label: 'Last 7 days'  },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export default function AdminAnalyticsDashboard() {
  const { user } = useAuthStore()
  const deptId = user?.department_id || ''
  const [dateRange, setDateRange] = useState('30')
  const [pdfExporting, setPdfExporting] = useState(false)

  const dateFrom = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const { data: ticketAnalytics, isLoading: ticketsLoading } = useQuery({
    queryKey: ['analytics', 'tickets', { deptId, dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/tickets', {
        params: { dept_id: deptId, date_from: dateFrom },
      })
      return data.data
    },
    enabled: !!deptId,
  })

  const { data: topIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['analytics', 'top-issues', { deptId, dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-issues', {
        params: { dept_id: deptId, date_from: dateFrom },
      })
      return data.data
    },
    enabled: !!deptId,
  })

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics', 'heatmap', { deptId, dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/heatmap', {
        params: { dept_id: deptId, date_from: dateFrom },
      })
      return data.data
    },
    enabled: !!deptId,
  })

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/analytics/export-csv', {
        params: { dept_id: deptId, date_from: dateFrom },
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${dateRange}days.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed.')
    }
  }

  const handleExportPDF = async () => {
    setPdfExporting(true)
    try {
      const { exportAnalyticsPDF } = await import('@/utils/exportPDF')
      await exportAnalyticsPDF('analytics-dashboard', `analytics-${dateRange}days.pdf`)
      toast.success('PDF exported.')
    } catch {
      toast.error('PDF export failed.')
    } finally {
      setPdfExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Department performance metrics and trends."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Analytics' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>CSV</Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} loading={pdfExporting} leftIcon={<FileText className="w-4 h-4" />}>PDF</Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-6">
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              dateRange === r.value
                ? 'bg-primary-700 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-500'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div id="analytics-dashboard" className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ticketsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
          ) : (
            <>
              <KPICard label="Total Tickets"   value={ticketAnalytics?.total ?? 0}                    color="blue"   />
              <KPICard label="Resolved"         value={ticketAnalytics?.resolved ?? 0}                 color="green"  />
              <KPICard label="Avg Resolution"   value={ticketAnalytics?.avg_resolution_hours ?? 0}     suffix="h" color="purple" />
              <KPICard label="SLA Breach Rate"  value={`${ticketAnalytics?.sla_breach_rate ?? 0}%`}   color="red"    />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ticketsLoading ? (
            <><SkeletonChart /><SkeletonChart /></>
          ) : (
            <>
              <TicketStatusDonutChart data={ticketAnalytics?.by_status ?? []} />
              <ResolutionTimeLineChart data={ticketAnalytics?.resolution_trend ?? []} />
            </>
          )}
        </div>

        <ComplaintHeatmap points={heatmapData ?? []} title="Geographic Complaint Distribution" />

        {issuesLoading ? <SkeletonChart /> : <TopIssuesTable data={topIssues ?? []} />}
      </div>
    </div>
  )
}
