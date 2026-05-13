'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { useEvents } from '@/hooks/useAnnouncements'
import { formatDate } from '@/utils/formatDate'
import api from '@/lib/api'
import toast from 'react-hot-toast'

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
  { value: 'Community', label: 'Community' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Culture', label: 'Culture' },
  { value: 'Government', label: 'Government' },
]

export default function EventsManagerPage() {
  const qc = useQueryClient()
  const [createModal, setCreateModal] = useState(false)
  const { data: events, isLoading } = useEvents()

  const createMutation = useMutation({
    mutationFn: async (payload: EventFormData) => {
      await api.post('/events', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created.')
      setCreateModal(false)
      form.reset()
    },
    onError: () => toast.error('Failed to create event.'),
  })

  const form = useForm<EventFormData>({ resolver: zodResolver(eventSchema) })

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Create and manage community events."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Events' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateModal(true)}>
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
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{event.category}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{formatDate(event.date)} · {event.location}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" aria-hidden="true" />
                <span>{event.registered_count} / {event.capacity} registered</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Event" size="lg">
        <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} noValidate className="space-y-4">
          <Input label="Event Title" required error={form.formState.errors.title?.message} {...form.register('title')} />
          <Textarea label="Description" required error={form.formState.errors.description?.message} {...form.register('description')} />
          <Select
            label="Category"
            required
            options={CATEGORY_OPTIONS}
            value={form.watch('category') || ''}
            onChange={(v) => form.setValue('category', v, { shouldValidate: true })}
            error={form.formState.errors.category?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" required error={form.formState.errors.date?.message} {...form.register('date')} />
            <Input label="Time" type="text" placeholder="e.g. 6:00 PM" required error={form.formState.errors.time?.message} {...form.register('time')} />
          </div>
          <Input label="Location" required error={form.formState.errors.location?.message} {...form.register('location')} />
          <Input label="Capacity" type="number" required error={form.formState.errors.capacity?.message} {...form.register('capacity')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button size="sm" type="submit" loading={createMutation.isPending}>Create Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
