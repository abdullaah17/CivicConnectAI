'use client'

import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import { useEvent, useRegisterForEvent, useUnregisterFromEvent } from '@/hooks/useAnnouncements'
import { formatDate } from '@/utils/formatDate'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = Array.isArray(params?.eventId) ? params.eventId[0] : (params?.eventId ?? '')
  const router = useRouter()
  const { data: event, isLoading } = useEvent(eventId)
  const register = useRegisterForEvent(eventId)
  const unregister = useUnregisterFromEvent(eventId)

  const handleRegister = async () => {
    try {
      await register.mutateAsync()
      toast.success(`You're registered for ${event?.title}!`)
    } catch {
      toast.error('Registration failed. Please try again.')
    }
  }

  const handleUnregister = async () => {
    try {
      await unregister.mutateAsync()
      toast.success('You have unregistered from this event.')
    } catch {
      toast.error('Failed to unregister. Please try again.')
    }
  }

  if (isLoading) return <div className="max-w-2xl"><SkeletonCard /></div>
  if (!event) return <div className="text-center py-16"><p className="text-gray-500">Event not found.</p></div>

  const isFull = event.registered_count >= event.capacity
  const capacityPct = Math.min(100, (event.registered_count / event.capacity) * 100)

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Events', href: '/events' },
          { label: event.title },
        ]}
      />

      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">{event.category}</Badge>
          {event.is_registered && <Badge variant="success">Registered ✓</Badge>}
          {isFull && !event.is_registered && <Badge variant="danger">At Capacity</Badge>}
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span>{formatDate(event.date)} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span>{event.registered_count} / {event.capacity} registered</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div>
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={event.registered_count}
            aria-valuemax={event.capacity}
            aria-label={`${event.registered_count} of ${event.capacity} spots filled`}
          >
            <div
              className={clsx('h-full rounded-full transition-all', isFull ? 'bg-danger' : 'bg-primary-500')}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">About this event</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </div>

        <div className="text-xs text-gray-400">
          Organised by {event.organizer?.name ?? 'City'} · {event.organizer?.department ?? ''}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          {!event.is_registered && (
            <Button
              size="sm"
              onClick={handleRegister}
              loading={register.isPending}
              disabled={isFull}
            >
              {isFull ? 'At Capacity' : 'Register Now'}
            </Button>
          )}
          {event.is_registered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnregister}
              loading={unregister.isPending}
              className="text-danger border-danger hover:bg-danger-bg"
            >
              Unregister
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
