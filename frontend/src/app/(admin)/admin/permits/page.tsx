'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/common/Badge'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Input'
import { formatDate, formatCurrency } from '@/utils/formatDate'
import api from '@/lib/api'
import type { PermitListItem, PermitStatus } from '@/types/permit'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Document Verification', label: 'Document Verification' },
  { value: 'Inspection Scheduled', label: 'Inspection Scheduled' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
]

const statusVariant: Record<PermitStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  'Draft':                  'default',
  'Submitted':              'primary',
  'Document Verification':  'warning',
  'Inspection Scheduled':   'info',
  'Approved':               'success',
  'Rejected':               'danger',
}

export default function AdminPermitsPage() {
  const [status, setStatus] = useState('')

  const { data: permits, isLoading } = useQuery({
    queryKey: ['permits', 'admin', { status }],
    queryFn: async () => {
      const { data } = await api.get('/permits', { params: { status: status || undefined } })
      return data.data as PermitListItem[]
    },
  })

  return (
    <div>
      <PageHeader
        title="Permit Applications"
        subtitle="Review and process permit applications for your department."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Permits' }]}
      />

      <div className="flex gap-3 mb-6">
        <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} containerClassName="w-52" />
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : !permits?.length ? (
        <EmptyState icon={<FileText className="w-12 h-12" />} title="No applications found" description="No permit applications match your filters." />
      ) : (
        <div className="space-y-3">
          {permits.map((permit) => (
            <Link
              key={permit.id}
              href={`/admin/permits/${permit.id}`}
              className="block bg-white rounded-lg shadow-card border border-gray-100 p-4 hover:border-primary-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-civic text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{permit.application_number}</span>
                    <Badge variant={statusVariant[permit.status]}>{permit.status}</Badge>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{permit.permit_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Applied {formatDate(permit.created_at)}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(permit.total_fee)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
