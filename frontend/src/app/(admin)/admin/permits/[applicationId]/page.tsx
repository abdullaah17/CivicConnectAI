'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { FeeCalculator } from '@/components/permits/FeeCalculator'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Input'
import { usePermit, useUpdatePermitStatus } from '@/hooks/usePermits'
import { formatDateTime, formatCurrency } from '@/utils/formatDate'
import { FileText, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PermitStatus } from '@/types/permit'

const statusVariant: Record<PermitStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  'Draft': 'default', 'Submitted': 'primary', 'Document Verification': 'warning',
  'Inspection Scheduled': 'info', 'Approved': 'success', 'Rejected': 'danger',
}

export default function AdminPermitReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const { data: permit, isLoading } = usePermit(applicationId)
  const updateStatus = useUpdatePermitStatus(applicationId)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync({ status: 'Approved' })
      toast.success('Application approved.')
    } catch {
      toast.error('Failed to approve application.')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    try {
      await updateStatus.mutateAsync({ status: 'Rejected', rejection_reason: rejectionReason })
      toast.success('Application rejected.')
      setRejectModal(false)
    } catch {
      toast.error('Failed to reject application.')
    }
  }

  const handleAdvanceStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ status })
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status.')
    }
  }

  if (isLoading) return <div className="max-w-2xl space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (!permit) return <div className="text-center py-16"><p className="text-gray-500">Application not found.</p></div>

  const canReview = permit.status === 'Submitted' || permit.status === 'Document Verification' || permit.status === 'Inspection Scheduled'

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Review Application"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Permits', href: '/admin/permits' },
          { label: permit.application_number },
        ]}
      />

      {/* Status + meta */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <span className="font-mono-civic text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded block mb-1">{permit.application_number}</span>
            <Badge variant={statusVariant[permit.status]}>{permit.status}</Badge>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <p>Applied {formatDateTime(permit.created_at)}</p>
            <p className="font-semibold text-gray-900">{formatCurrency(permit.total_fee)}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 text-sm space-y-1">
          <p><span className="text-gray-500">Applicant:</span> <span className="font-medium">{permit.applicant?.name}</span></p>
          <p><span className="text-gray-500">Email:</span> <span className="font-medium">{permit.applicant?.email}</span></p>
          <p><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{permit.permit_type.replace('_', ' ')}</span></p>
        </div>
      </div>

      {/* Form data */}
      {permit.form_data && Object.keys(permit.form_data).length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Application Details</h3>
          <div className="space-y-2">
            {Object.entries(permit.form_data).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 text-sm">
                <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900 text-right">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {(permit.documents?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Submitted Documents</h3>
          <div className="space-y-2">
            {permit.documents.map((doc) => (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors">
                <FileText className="w-4 h-4" aria-hidden="true" />
                {doc.filename}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Fee */}
      {(permit.fee_breakdown?.length ?? 0) > 0 && (
        <div className="mb-4">
          <FeeCalculator breakdown={permit.fee_breakdown} total={permit.total_fee} />
        </div>
      )}

      {/* Review actions */}
      {canReview && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">Review Actions</h3>
          <div className="flex flex-wrap gap-2">
            {permit.status === 'Submitted' && (
              <Button size="sm" variant="secondary" onClick={() => handleAdvanceStatus('Document Verification')}>
                Request Document Verification
              </Button>
            )}
            {permit.status === 'Document Verification' && (
              <Button size="sm" variant="secondary" onClick={() => handleAdvanceStatus('Inspection Scheduled')}>
                Schedule Inspection
              </Button>
            )}
            <Button
              size="sm"
              variant="success"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleApprove}
              loading={updateStatus.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setRejectModal(true)}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Rejection modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Application" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Provide a reason for rejection. This will be visible to the applicant.</p>
          <Textarea
            label="Rejection Reason"
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Incomplete documentation — venue agreement missing."
            maxLength={500}
            showCount
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleReject} loading={updateStatus.isPending} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
