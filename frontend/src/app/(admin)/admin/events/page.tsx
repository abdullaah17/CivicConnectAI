'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Plus, Users, XCircle, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { useEvents } from '@/hooks/useAnnouncements'
import { formatDate } from '@/utils/formatDate'
import { getErrorMessage } from '@/lib/errorHandler'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Event } from '@/types/announcement'

const eventSchema = z.object({
  title:       z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category:    z.string().min(1, 'Category is required'),
  date:        z.string().min(1, 'Date is required'),
  time:        z.string().min(1, 'Time is required'),
  location:    z.string().min(3, 'Location is required'),
  capacity:    z.coerce.number().int().min(1).max(100000),
})
type EventFormData = z.infer<typeof eventSchema>

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category...' },
  { value: 'general', label: 'General' },
  { value: 'health', label: 'Health' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'culture', label: 'Culture' },
  { value: 'emergency', label: 'Emergency' },
]

export default function EventsManagerPage() {
  const qc = useQueryClient()
  const [createModal, setCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Event | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Event | null>(null)

  const { data: events, isLoading } = useEvents()

  const form = useForm<EventFormData>({ resolver: zodResolver(eventSchema) })

  const createMutation = useMutation({
    mutationFn: async (payload: EventFormData) => {
      // Backend expects event_date as an ISO datetime string
      const { date, time, ...rest } = payload
      await api.post('/events', {
        ...rest,
        event_date: `${date}T${convertTimeTo24h(time)}:00.000Z`,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created.')
      setCreateModal(false)
      form.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to create event.')),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: EventFormData }) => {
      const { date, time, ...rest } = payload
      await api.patch(`/events/${id}`, {
        ...rest,
        event_date: `${date}T${convertTimeTo24h(time)}:00.000Z`,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event updated.')
      setEditTarget(null)
      form.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update event.')),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event cancelled.')
      setCancelTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to cancel event.')),
  })

  const openEdit = (event: Event) => {
    setEditTarget(event)
    form.reset({
      title:       event.title,
      description: event.description,
      category:    event.category,
      date:        event.date,
      time:        event.time,
      location:    event.location,
      capacity:    event.capacity,
    })
  }

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Create and manage community events."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Events' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { form.reset(); setCreateModal(true) }}>
            Create Event
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !events?.length ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="No events yet"
          description="Create your first community event."
          ctaLabel="Create Event"
          ctaAction={() => setCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary">{event.category}</Badge>
                  {event.is_cancelled && <Badge variant="danger">Cancelled</Badge>}
                </div>
                {!event.is_cancelled && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(event)} aria-label={`Edit ${event.title}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(event)}
                      aria-label={`Cancel ${event.title}`}
                      className="text-danger hover:bg-danger-bg"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{formatDate(event.date)} at {event.time} · {event.location}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" aria-hidden="true" />
                <span>{event.registered_count} / {event.capacity} registered</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <EventFormModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Event"
        form={form}
        onSubmit={(d) => createMutation.mutate(d)}
        isPending={createMutation.isPending}
      />

      {/* Edit modal */}
      <EventFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Event"
        form={form}
        onSubmit={(d) => editTarget && editMutation.mutate({ id: editTarget.id, payload: d })}
        isPending={editMutation.isPending}
        submitLabel="Save Changes"
      />

      {/* Cancel confirm modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Event" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel <strong>&ldquo;{cancelTarget?.title}&rdquo;</strong>?
            All registered attendees will be notified.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>Keep Event</Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
            >
              Cancel Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Shared form modal ─────────────────────────────────────────────────────────
function EventFormModal({
  open, onClose, title, form, onSubmit, isPending, submitLabel = 'Create Event',
}: {
  open: boolean
  onClose: () => void
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  onSubmit: (d: EventFormData) => void
  isPending: boolean
  submitLabel?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label="Event Title" required error={form.formState.errors.title?.message} {...form.register('title')} />
        <Textarea label="Description" required error={form.formState.errors.description?.message} {...form.register('description')} />
        <Select
          label="Category"
          required
          options={CATEGORY_OPTIONS}
          value={form.watch('category') || ''}
          onChange={(v: string) => form.setValue('category', v, { shouldValidate: true })}
          error={form.formState.errors.category?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" required error={form.formState.errors.date?.message} {...form.register('date')} />
          <Input label="Time" type="text" placeholder="e.g. 6:00 PM" required error={form.formState.errors.time?.message} {...form.register('time')} />
        </div>
        <Input label="Location" required error={form.formState.errors.location?.message} {...form.register('location')} />
        <Input label="Capacity" type="number" required error={form.formState.errors.capacity?.message} {...form.register('capacity')} />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button size="sm" type="submit" loading={isPending}>{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  )
}

function convertTimeTo24h(time: string): string {
  try {
    const [timePart, modifier] = time.trim().split(' ')
    const parts = timePart.split(':').map(Number)
    let hours = parts[0]
    const minutes = parts[1] ?? 0
    if (modifier?.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  } catch {
    return '00:00'
  }
}
