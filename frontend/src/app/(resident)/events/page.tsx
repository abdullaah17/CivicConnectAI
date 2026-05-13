'use client'

import Link from 'next/link'
import { Calendar, MapPin, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useEvents } from '@/hooks/useAnnouncements'
import { formatDate } from '@/utils/formatDate'
import { clsx } from 'clsx'

export default function EventBoardPage() {
  const { data: events, isLoading } = useEvents()

  return (
    <div>
      <PageHeader
        title="Event Board"
        subtitle="Community events and city programs."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Events' }]}
      />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !events?.length ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="No upcoming events"
          description="Check back later for community events and programs."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => {
            const isFull = event.registered_count >= event.capacity
            const capacityPct = Math.min(100, (event.registered_count / event.capacity) * 100)

            return (
              <article key={event.id} className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary">{event.category}</Badge>
                    {event.is_registered && <Badge variant="success">Registered ✓</Badge>}
                  </div>
                  <h3 className="font-display font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" aria-hidden="true" />
                        {event.registered_count} / {event.capacity} registered
                      </span>
                      {isFull && <span className="text-danger font-medium">Full</span>}
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', isFull ? 'bg-danger' : 'bg-primary-500')}
                        style={{ width: `${capacityPct}%` }}
                        role="progressbar"
                        aria-valuenow={event.registered_count}
                        aria-valuemax={event.capacity}
                        aria-label={`${event.registered_count} of ${event.capacity} spots filled`}
                      />
                    </div>
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <Button
                      variant={event.is_registered ? 'success' : isFull ? 'ghost' : 'primary'}
                      size="sm"
                      className="w-full"
                      disabled={isFull && !event.is_registered}
                    >
                      {event.is_registered ? 'View Details' : isFull ? 'At Capacity' : 'Register'}
                    </Button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
