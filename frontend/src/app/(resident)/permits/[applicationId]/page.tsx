'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/common/Badge'
import { FeeCalculator } from '@/components/permits/FeeCalculator'
import { PermitCertificateCard } from '@/components/permits/PermitCertificateCard'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { usePermit } from '@/hooks/usePermits'
import { formatDateTime, formatCurrency } from '@/utils/formatDate'
import { FileText, Calendar, User } from 'lucide-react'
import type { PermitStatus } from '@/types/permit'

const statusVariant: Record<PermitStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  'Draft':                  'default',
  'Submitted':              'primary',
  'Document Verification':  'warning',
  'Inspection Scheduled':   'info',
  'Approved':               'success',
  'Rejected':               'danger',
}

export default function PermitDetailPage() {
  const params = useParams<{ applicationId: string }>()
  const applicationId = Array.isArray(params?.applicationId) ? params.applicationId[0] : (params?.applicationId ?? '')
  const { data: permit, isLoading } = usePermit(applicationId)

  if (isLoading) return <div className="max-w-2xl space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (!permit) return <div className="text-center py-16"><p className="text-gray-500">Application not found.</p></div>

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`${permit.permit_type.replace('_', ' ')} Application`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Permits', href: '/permits' },
          { label: permit.application_number },
        ]}
      />

      {/* Approved certificate */}
      {permit.status === 'Approved' && (
        <div className="mb-4">
          <PermitCertificateCard permit={permit} />
        </div>
      )}

      {/* Rejected notice */}
      {permit.status === 'Rejected' && permit.rejection_reason && (
        <div className="bg-danger-bg border border-danger rounded-lg p-4 mb-4">
          <p className="font-semibold text-danger text-sm mb-1">Application Rejected</p>
          <p className="text-sm text-red-700">{permit.rejection_reason}</p>
        </div>
      )}

      {/* Status card */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <span className="font-mono-civic text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded block mb-1">
              {permit.application_number}
            </span>
            <Badge variant={statusVariant[permit.status]}>{permit.status}</Badge>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Applied {formatDateTime(permit.created_at)}</span>
            </div>
            {permit.reviewed_by && (
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reviewed by {permit.reviewed_by.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form data summary */}
        {permit.form_data && Object.keys(permit.form_data).length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Application Details</h3>
            {Object.entries(permit.form_data).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 text-sm">
                <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900 text-right">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      {(permit.documents?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Submitted Documents</h3>
          <div className="space-y-2">
            {permit.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                {doc.filename}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Fee breakdown */}
      {(permit.fee_breakdown?.length ?? 0) > 0 && (
        <div className="mb-4">
          <FeeCalculator breakdown={permit.fee_breakdown} total={permit.total_fee} />
        </div>
      )}

      {/* Payment receipt */}
      {permit.payment_receipt && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Receipt</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt Number</span>
              <span className="font-mono-civic font-medium">{permit.payment_receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">{formatCurrency(permit.payment_receipt.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{formatDateTime(permit.payment_receipt.date)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
