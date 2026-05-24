'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileDown, ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { KPICard } from '@/components/analytics/KPICard'
import { SkeletonKPICard } from '@/components/common/SkeletonLoader'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30')
  const [deptFilter, setDeptFilter] = useState('')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)

  const dateFrom = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments')
      return data.data as { id: string; name: string }[]
    },
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports', 'stats', { dateRange, deptFilter }],
    queryFn: async () => {
      const { data } = await api.get('/analytics/tickets', {
        params: { date_from: dateFrom, dept_id: deptFilter || undefined },
      })
      return data.data
    },
  })

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format)
    try {
      const endpoint = format === 'csv' ? '/analytics/export-csv' : '/analytics/export-pdf'
      const response = await api.get(endpoint, {
        params: { date_from: dateFrom, dept_id: deptFilter || undefined },
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `civicconnect-report-${dateRange}days.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} report downloaded.`)
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report.`)
    } finally {
      setExporting(null)
    }
  }

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...(departments || []).map((d) => ({ value: d.id, label: d.name })),
  ]

  const rangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
  ]

  return (
    <div>
      <PageHeader
        variant="dark"
        title="Reports"
        subtitle="Generate and export system-wide reports for city council."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Reports' }]}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Report Parameters</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <Select label="Date Range" options={rangeOptions} value={dateRange} onChange={setDateRange} containerClassName="w-44" />
          <Select label="Department" options={deptOptions} value={deptFilter} onChange={setDeptFilter} containerClassName="w-52" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            loading={exporting === 'csv'}
            leftIcon={<FileDown className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            leftIcon={<ScrollText className="w-4 h-4" />}
          >
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* Preview stats */}
      <h2 className="font-semibold text-white mb-4">Report Preview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)
        ) : (
          <>
            <KPICard label="Total Tickets" value={stats?.total ?? 0} color="blue" />
            <KPICard label="Resolved" value={stats?.resolved ?? 0} color="green" />
            <KPICard label="SLA Breached" value={stats?.sla_breached ?? 0} color="red" />
            <KPICard label="Avg Resolution" value={stats?.avg_resolution_hours ?? 0} suffix="h" color="purple" />
          </>
        )}
      </div>
    </div>
  )
}
