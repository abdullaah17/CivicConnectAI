'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Megaphone, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { formatDate } from '@/utils/formatDate'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Announcement } from '@/types/announcement'

const announcementSchema = z.object({
  title:       z.string().min(5, 'Min 5 characters').max(200),
  body:        z.string().min(20, 'Min 20 characters').max(5000),
  category:    z.string().min(1, 'Select a category'),
  priority:    z.enum(['normal', 'urgent', 'emergency']),
  expiry_date: z.string().optional(),
})
type AnnouncementFormData = z.infer<typeof announcementSchema>

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category...' },
  { value: 'General', label: 'General' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Health', label: 'Health' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Events', label: 'Events' },
  { value: 'Permits', label: 'Permits' },
]

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
]

export default function AnnouncementsManagerPage() {
  const qc = useQueryClient()
  const [createModal, setCreateModal] = useState(false)

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: async () => {
      const { data } = await api.get('/announcements')
      return data.data as Announcement[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: AnnouncementFormData) => {
      await api.post('/announcements', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement published.')
      setCreateModal(false)
      form.reset()
    },
    onError: () => toast.error('Failed to publish announcement.'),
  })

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { priority: 'normal' },
  })

  const priorityVariant = { normal: 'default', urgent: 'warning', emergency: 'danger' } as const

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Publish and manage city announcements."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Announcements' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateModal(true)}>
            New Announcement
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !announcements?.length ? (
        <EmptyState
          icon={<Megaphone className="w-12 h-12" />}
          title="No announcements yet"
          description="Publish your first announcement."
          ctaLabel="Create Announcement"
          ctaAction={() => setCreateModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={priorityVariant[ann.priority]}>{ann.priority}</Badge>
                    <Badge variant="default">{ann.category}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(ann.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{ann.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{ann.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Announcement" size="lg">
        <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} noValidate className="space-y-4">
          <Input label="Title" required error={form.formState.errors.title?.message} {...form.register('title')} />
          <Textarea label="Body" required maxLength={5000} showCount error={form.formState.errors.body?.message} {...form.register('body')} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              options={CATEGORY_OPTIONS}
              value={form.watch('category') || ''}
              onChange={(v) => form.setValue('category', v, { shouldValidate: true })}
              error={form.formState.errors.category?.message}
            />
            <Select
              label="Priority"
              required
              options={PRIORITY_OPTIONS}
              value={form.watch('priority')}
              onChange={(v) => form.setValue('priority', v as 'normal' | 'urgent' | 'emergency')}
            />
          </div>
          <Input label="Expiry Date" type="date" helperText="Leave blank for no expiry" {...form.register('expiry_date')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button size="sm" type="submit" loading={createMutation.isPending}>Publish</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
