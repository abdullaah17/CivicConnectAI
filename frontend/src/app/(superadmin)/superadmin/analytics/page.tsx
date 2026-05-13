'use client'

import dynamic from 'next/dynamic'
import { SkeletonChart, SkeletonKPICard } from '@/components/common/SkeletonLoader'

const SuperAdminAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/SuperAdminAnalyticsDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart /><SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    ),
  }
)

export default function SuperAdminAnalyticsPage() {
  return <SuperAdminAnalyticsDashboard />
}
