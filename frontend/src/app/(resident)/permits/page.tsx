'use client'

import Link from 'next/link'
import { FileText, HardHat, Calendar, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useMyPermits } from '@/hooks/usePermits'
import { formatDate, formatCurrency } from '@/utils/formatDate'
import type { PermitType, PermitStatus } from '@/types/permit'

const permitTypeConfig: Record<PermitType, { icon: React.ReactNode; label: string; description: string; fee: string }> = {
  construction_permit: {
    icon: <HardHat className="w-6 h-6" />,
    label: 'Construction Permit',
    description: 'For building, renovation, or demolition projects.',
    fee: 'From PKR 10,000',
  },
  event_permit: {
    icon: <Calendar className="w-6 h-6" />,
    label: 'Event Permit',
    description: 'For public events, gatherings, and performances.',
    fee: 'From PKR 5,000',
  },
  business_license_renewal: {
    icon: <Briefcase className="w-6 h-6" />,
    label: 'Business License Renewal',
    description: 'Renew your existing business operating license.',
    fee: 'From PKR 3,000',
  },
}

const statusVariant: Record<PermitStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  'Draft':                  'default',
  'Submitted':              'primary',
  'Document Verification':  'warning',
  'Inspection Scheduled':   'info',
  'Approved':               'success',
  'Rejected':               'danger',
}

export default function PermitPortalPage() {
  const { data: permits, isLoading } = useMyPermits()

  return (
    <div>
      <PageHeader
        variant="dark"
        title="Permit Portal"
        subtitle="Apply for city permits and track your applications."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Permits' }]}
      />

      {/* Permit type cards */}
      <h2 className="font-display font-semibold text-white text-lg mb-4">Apply for a Permit</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {(Object.entries(permitTypeConfig) as [PermitType, typeof permitTypeConfig[PermitType]][]).map(([type, config]) => (
          <div key={type} className="bg-white rounded-lg shadow-card border border-gray-100 p-5 flex flex-col">
            <div className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              {config.icon}
            </div>
            <h3 className="font-display font-semibold text-gray-900 mb-1">{config.label}</h3>
            <p className="text-sm text-gray-600 flex-1 mb-3">{config.description}</p>
            <p className="text-xs text-gray-400 mb-3">{config.fee}</p>
            <Link href={`/permits/apply/${type}`}>
              <Button variant="primary" size="sm" className="w-full">
                Apply Now
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* My applications */}
      <h2 className="font-display font-semibold text-white text-lg mb-4">My Applications</h2>
      {isLoading ? (
        <SkeletonList count={3} />
      ) : !permits?.length ? (
        <EmptyState
          variant="dark"
          icon={<FileText className="w-12 h-12" />}
          title="No applications yet"
          description="Your permit applications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {permits.map((permit) => (
            <Link
              key={permit.id}
              href={`/permits/${permit.id}`}
              className="block bg-white rounded-lg shadow-card border border-gray-100 p-4 hover:border-primary-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-civic text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {permit.application_number}
                    </span>
                    <Badge variant={statusVariant[permit.status]}>{permit.status}</Badge>
                  </div>
                  <p className="font-display font-semibold text-gray-900 text-sm">
                    {permitTypeConfig[permit.permit_type]?.label}
                  </p>
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
