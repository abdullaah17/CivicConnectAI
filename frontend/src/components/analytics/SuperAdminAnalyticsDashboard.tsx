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
import api from '@/lib/api'
import toast from 'react-hot-toast'

const DATE_RANGES = [
  { value: '7',  label: 'Last 7 days'  },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export default function SuperAdminAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30')
  const [pdfExporting, setPdfExporting] = useState(false)

  const dateFrom = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'system', { dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/tickets', { params: { date_from: dateFrom } })
      return data.data
    },
  })

  const { data: topIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['analytics', 'top-issues', 'system', { dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-issues', { params: { date_from: dateFrom } })
      return data.data
    },
  })

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics', 'heatmap', 'system', { dateRange }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/heatmap', { params: { date_from: dateFrom } })
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

  const handleExportPDF = async () => {
    setPdfExporting(true)
    try {
      const { exportAnalyticsPDF } = await import('@/utils/exportPDF')
      await exportAnalyticsPDF('superadmin-analytics-dashboard', `system-analytics-${dateRange}days.pdf`)
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
        title="System Analytics"
        subtitle="City-wide performance metrics across all departments."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Analytics' }]}
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
              dateRange === r.value ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-500'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div id="superadmin-analytics-dashboard" className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
          ) : (
            <>
              <KPICard label="Total Tickets"  value={analytics?.total ?? 0}                  color="blue"   />
              <KPICard label="Resolved"        value={analytics?.resolved ?? 0}               color="green"  />
              <KPICard label="Avg Resolution"  value={analytics?.avg_resolution_hours ?? 0}   suffix="h" color="purple" />
              <KPICard label="SLA Breach Rate" value={`${analytics?.sla_breach_rate ?? 0}%`} color="red"    />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? <><SkeletonChart /><SkeletonChart /></> : (
            <>
              <TicketStatusDonutChart data={analytics?.by_status ?? []} />
              <ResolutionTimeLineChart data={analytics?.resolution_trend ?? []} />
            </>
          )}
        </div>

        <ComplaintHeatmap points={heatmapData ?? []} title="City-Wide Complaint Distribution" />

        {issuesLoading ? <SkeletonChart /> : <TopIssuesTable data={topIssues ?? []} />}
      </div>
    </div>
  )
}
