'use client'

import dynamic from 'next/dynamic'
import { SkeletonChart, SkeletonKPICard } from '@/components/common/SkeletonLoader'

// Load the entire analytics dashboard client-only — prevents any SSR crash
const AdminAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AdminAnalyticsDashboard'),
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

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsDashboard />
}
