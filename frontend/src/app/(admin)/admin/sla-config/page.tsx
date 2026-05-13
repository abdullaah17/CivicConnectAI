'use client'

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const slaSchema = z.object({
  low:       z.coerce.number().int().min(24).max(720),
  medium:    z.coerce.number().int().min(8).max(168),
  high:      z.coerce.number().int().min(2).max(48),
  emergency: z.coerce.number().int().min(1).max(4),
})
type SLAFormData = z.infer<typeof slaSchema>

const PRIORITY_INFO = [
  { key: 'low' as const,       label: 'Low Priority',       min: 24,  max: 720, hint: '24–720 hours' },
  { key: 'medium' as const,    label: 'Medium Priority',    min: 8,   max: 168, hint: '8–168 hours' },
  { key: 'high' as const,      label: 'High Priority',      min: 2,   max: 48,  hint: '2–48 hours' },
  { key: 'emergency' as const, label: 'Emergency Priority', min: 1,   max: 4,   hint: '1–4 hours' },
]

export default function SLAConfigPage() {
  const { user } = useAuthStore()
  const deptId = user?.department_id || ''

  const { data: config } = useQuery({
    queryKey: ['sla-config', deptId],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${deptId}/sla`)
      return data.data as SLAFormData
    },
    enabled: !!deptId,
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: SLAFormData) => {
      await api.patch(`/departments/${deptId}/sla`, payload)
    },
    onSuccess: () => toast.success('SLA configuration saved.'),
    onError: () => toast.error('Failed to save SLA configuration.'),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SLAFormData>({
    resolver: zodResolver(slaSchema),
    defaultValues: { low: 168, medium: 48, high: 8, emergency: 2 },
  })

  useEffect(() => {
    if (config) reset(config)
  }, [config, reset])

  return (
    <div className="max-w-xl">
      <PageHeader
        title="SLA Configuration"
        subtitle="Set resolution time targets per priority level for your department."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'SLA Config' }]}
      />

      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5 text-sm text-gray-600 bg-primary-50 rounded-lg p-3">
          <Clock className="w-4 h-4 text-primary-700 flex-shrink-0" aria-hidden="true" />
          <span>SLA hours define the maximum time allowed to resolve a ticket at each priority level. Tickets exceeding these limits trigger breach alerts.</span>
        </div>

        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} noValidate className="space-y-4">
          {PRIORITY_INFO.map((p) => (
            <Input
              key={p.key}
              label={`${p.label} (hours)`}
              type="number"
              required
              helperText={p.hint}
              error={errors[p.key]?.message}
              {...register(p.key)}
            />
          ))}
          <Button type="submit" loading={isSubmitting || saveMutation.isPending} leftIcon={<Settings className="w-4 h-4" />}>
            Save Configuration
          </Button>
        </form>
      </div>
    </div>
  )
}
