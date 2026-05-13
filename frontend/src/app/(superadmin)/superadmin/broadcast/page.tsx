'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Radio, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const broadcastSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(20, 'Body must be at least 20 characters').max(5000),
})

type BroadcastFormData = z.infer<typeof broadcastSchema>

export default function EmergencyBroadcastPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BroadcastFormData>({ resolver: zodResolver(broadcastSchema) })

  const onSubmit = async (data: BroadcastFormData) => {
    try {
      await api.post('/announcements', {
        ...data,
        category: 'Safety',
        priority: 'emergency',
      })
      toast.success('Emergency broadcast sent to all residents.')
      reset()
    } catch {
      toast.error('Failed to send broadcast. Please try again.')
    }
  }

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

      <div className="bg-danger-bg border border-danger rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-display font-semibold text-danger text-sm">Use with caution</p>
          <p className="text-sm text-red-700 mt-0.5">
            This will immediately display a full-screen alert to all logged-in residents. Only use for genuine emergencies.
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
            Send Emergency Broadcast
          </Button>
        </form>
      </div>
    </div>
  )
}
