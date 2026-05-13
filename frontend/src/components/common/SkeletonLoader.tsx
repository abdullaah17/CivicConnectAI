import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={clsx('animate-pulse bg-gray-200 rounded', className)}
    aria-hidden="true"
  />
)

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg p-4 shadow-card space-y-3" aria-busy="true">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  </div>
)

export const SkeletonTableRow = () => (
  <tr aria-busy="true">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

export const SkeletonTextLine = ({ width = 'full' }: { width?: string }) => (
  <Skeleton className={`h-4 w-${width}`} />
)

export const SkeletonAvatar = ({ size = 10 }: { size?: number }) => (
  <Skeleton className={`h-${size} w-${size} rounded-full`} />
)

export const SkeletonChart = () => (
  <div className="bg-white rounded-lg p-4 shadow-card" aria-busy="true">
    <Skeleton className="h-5 w-40 mb-4" />
    <Skeleton className="h-48 w-full rounded" />
  </div>
)

export const SkeletonKPICard = () => (
  <div className="bg-white rounded-lg p-5 shadow-card space-y-2" aria-busy="true">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-24" />
  </div>
)

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading...">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)
