'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Radio, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { getErrorMessage } from '@/lib/errorHandler'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const broadcastSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body:  z.string().min(20, 'Body must be at least 20 characters').max(5000),
})
type BroadcastFormData = z.infer<typeof broadcastSchema>

export default function EmergencyBroadcastPage() {
  const qc = useQueryClient()
  const [confirmModal, setConfirmModal] = useState(false)
  const [pendingData, setPendingData] = useState<BroadcastFormData | null>(null)
  const [sending, setSending] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastFormData>({ resolver: zodResolver(broadcastSchema) })

  // Show confirm modal before actually sending
  const onSubmit = (data: BroadcastFormData) => {
    setPendingData(data)
    setConfirmModal(true)
  }

  const handleConfirmedSend = async () => {
    if (!pendingData) return
    setSending(true)
    try {
      await api.post('/announcements', {
        ...pendingData,
        category: 'Safety',
        priority: 'emergency',
      })
      // Invalidate announcements so residents see it immediately
      qc.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Emergency broadcast sent to all residents.')
      reset()
      setConfirmModal(false)
      setPendingData(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to send broadcast. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  const title = watch('title')

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Emergency Broadcast"
        subtitle="Send an emergency alert to all residents. This will display as a full-screen banner."
        breadcrumbs={[
          { label: 'Overview', href: '/superadmin/dashboard' },
          { label: 'Emergency Broadcast' },
        ]}
      />

      {/* Warning banner */}
      <div className="bg-danger-bg border border-danger rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold text-danger text-sm">Use with caution</p>
          <p className="text-sm text-red-700 mt-0.5">
            This will immediately display a full-screen alert to all logged-in residents.
            Only use for genuine emergencies. You will be asked to confirm before sending.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Alert Title"
            placeholder="e.g. Water Supply Disruption — Sector F-7"
            required
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Alert Message"
            placeholder="Provide full details of the emergency, affected areas, and any instructions for residents..."
            required
            maxLength={5000}
            showCount
            error={errors.body?.message}
            {...register('body')}
          />
          <Button
            type="submit"
            variant="danger"
            size="lg"
            loading={isSubmitting}
            leftIcon={<Radio className="w-4 h-4" />}
            className="w-full"
          >
            Review &amp; Send Broadcast
          </Button>
        </form>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={confirmModal}
        onClose={() => { setConfirmModal(false); setPendingData(null) }}
        title="Confirm Emergency Broadcast"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-danger-bg border border-danger rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">
              This will send an emergency alert to <strong>all residents</strong> immediately.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-gray-600 line-clamp-3">{pendingData?.body}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setConfirmModal(false); setPendingData(null) }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={sending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmedSend}
            >
              Confirm &amp; Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
