'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Megaphone, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { formatDate } from '@/utils/formatDate'
import { getErrorMessage } from '@/lib/errorHandler'
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

const priorityVariant = { normal: 'default', urgent: 'warning', emergency: 'danger' } as const

export default function AnnouncementsManagerPage() {
  const qc = useQueryClient()
  const [createModal, setCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: async () => {
      const { data } = await api.get('/announcements')
      return data.data as Announcement[]
    },
  })

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { priority: 'normal' },
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
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to publish announcement.')),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AnnouncementFormData }) => {
      await api.patch(`/announcements/${id}`, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement updated.')
      setEditTarget(null)
      form.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update announcement.')),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/announcements/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement deleted.')
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to delete announcement.')),
  })

  const openEdit = (ann: Announcement) => {
    setEditTarget(ann)
    form.reset({
      title:       ann.title,
      body:        ann.body,
      category:    ann.category,
      priority:    ann.priority as 'normal' | 'urgent' | 'emergency',
      expiry_date: ann.expiry_date ?? '',
    })
  }

  const handleCreate = (d: AnnouncementFormData) => createMutation.mutate(d)
  const handleEdit   = (d: AnnouncementFormData) => {
    if (!editTarget) return
    editMutation.mutate({ id: editTarget.id, payload: d })
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Publish and manage city announcements."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Announcements' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { form.reset({ priority: 'normal' }); setCreateModal(true) }}>
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={priorityVariant[ann.priority as keyof typeof priorityVariant] ?? 'default'}>{ann.priority}</Badge>
                    <Badge variant="default">{ann.category}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(ann.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{ann.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{ann.body}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(ann)}
                    aria-label={`Edit ${ann.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(ann)}
                    aria-label={`Delete ${ann.title}`}
                    className="text-danger hover:bg-danger-bg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnnouncementFormModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="New Announcement"
        form={form}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      {/* Edit modal */}
      <AnnouncementFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Announcement"
        form={form}
        onSubmit={handleEdit}
        isPending={editMutation.isPending}
        submitLabel="Save Changes"
      />

      {/* Delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Announcement" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Shared form modal ─────────────────────────────────────────────────────────
function AnnouncementFormModal({
  open, onClose, title, form, onSubmit, isPending, submitLabel = 'Publish',
}: {
  open: boolean
  onClose: () => void
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  onSubmit: (d: AnnouncementFormData) => void
  isPending: boolean
  submitLabel?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label="Title" required error={form.formState.errors.title?.message} {...form.register('title')} />
        <Textarea label="Body" required maxLength={5000} showCount error={form.formState.errors.body?.message} {...form.register('body')} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            options={CATEGORY_OPTIONS}
            value={form.watch('category') || ''}
            onChange={(v: string) => form.setValue('category', v, { shouldValidate: true })}
            error={form.formState.errors.category?.message}
          />
          <Select
            label="Priority"
            required
            options={PRIORITY_OPTIONS}
            value={form.watch('priority')}
            onChange={(v: string) => form.setValue('priority', v as 'normal' | 'urgent' | 'emergency')}
          />
        </div>
        <Input label="Expiry Date" type="date" helperText="Leave blank for no expiry" {...form.register('expiry_date')} />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button size="sm" type="submit" loading={isPending}>{submitLabel}</Button>
        </div>
      </form>
    </Modal>
  )
}
