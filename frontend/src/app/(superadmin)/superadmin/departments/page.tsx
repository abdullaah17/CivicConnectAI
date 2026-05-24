'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Settings } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/common/Badge'
import { getErrorMessage } from '@/lib/errorHandler'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Department {
  id: string
  name: string
  code: string
  head_name?: string
  total_tickets: number
  open_tickets: number
  sla_breach_rate: number
}

const slaSchema = z.object({
  low:       z.coerce.number().int().min(24).max(720),
  medium:    z.coerce.number().int().min(8).max(168),
  high:      z.coerce.number().int().min(2).max(48),
  emergency: z.coerce.number().int().min(1).max(4),
})
type SLAFormData = z.infer<typeof slaSchema>

export default function DepartmentsPage() {
  const qc = useQueryClient()
  const [slaTarget, setSlaTarget] = useState<Department | null>(null)

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments')
      return data.data as Department[]
    },
  })

  const { data: slaConfig } = useQuery({
    queryKey: ['sla-config', slaTarget?.id],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${slaTarget!.id}/sla`)
      return data.data as SLAFormData
    },
    enabled: !!slaTarget,
  })

  const saveSLA = useMutation({
    mutationFn: async (payload: SLAFormData) => {
      await api.patch(`/departments/${slaTarget!.id}/sla`, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sla-config'] })
      toast.success('SLA configuration saved.')
      setSlaTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to save SLA configuration.')),
  })

  const form = useForm<SLAFormData>({
    resolver: zodResolver(slaSchema),
    defaultValues: { low: 168, medium: 48, high: 8, emergency: 2 },
  })

  // Populate form when config loads
  const handleOpenSLA = (dept: Department) => {
    setSlaTarget(dept)
    form.reset({ low: 168, medium: 48, high: 8, emergency: 2 })
  }

  // When slaConfig arrives, reset form with real values
  if (slaConfig && slaTarget) {
    const current = form.getValues()
    if (current.low === 168 && slaConfig.low !== 168) {
      form.reset(slaConfig)
    }
  }

  return (
    <div>
      <PageHeader
        variant="dark"
        title="Departments"
        subtitle="System-wide department overview and SLA configuration."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Departments' }]}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !departments?.length ? (
        <EmptyState
          variant="dark"
          icon={<Building2 className="w-12 h-12" />}
          title="No departments configured"
          description="Contact system administrator."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <span className="font-mono-civic text-xs text-gray-400">{dept.code}</span>
                </div>
                <Badge variant={dept.sla_breach_rate > 25 ? 'danger' : dept.sla_breach_rate > 10 ? 'warning' : 'success'}>
                  {dept.sla_breach_rate}% breach
                </Badge>
              </div>

              {dept.head_name && (
                <p className="text-sm text-gray-600 mb-3">
                  Head: <span className="font-medium">{dept.head_name}</span>
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-xl font-bold text-gray-900">{dept.total_tickets}</p>
                  <p className="text-xs text-gray-500">Total Tickets</p>
                </div>
                <div className="bg-amber-50 rounded p-2 text-center">
                  <p className="text-xl font-bold text-amber-700">{dept.open_tickets}</p>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Settings className="w-3.5 h-3.5" />}
                onClick={() => handleOpenSLA(dept)}
              >
                Configure SLA
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* SLA config modal */}
      <Modal
        open={!!slaTarget}
        onClose={() => setSlaTarget(null)}
        title={`SLA Config — ${slaTarget?.name ?? ''}`}
        size="sm"
      >
        <form onSubmit={form.handleSubmit((d) => saveSLA.mutate(d))} noValidate className="space-y-4">
          <p className="text-xs text-gray-500">
            Set maximum resolution hours per priority level for this department.
          </p>
          {([
            { key: 'low' as const,       label: 'Low Priority',       hint: '24–720 h' },
            { key: 'medium' as const,    label: 'Medium Priority',    hint: '8–168 h' },
            { key: 'high' as const,      label: 'High Priority',      hint: '2–48 h' },
            { key: 'emergency' as const, label: 'Emergency Priority', hint: '1–4 h' },
          ]).map((p) => (
            <Input
              key={p.key}
              label={`${p.label} (hours)`}
              type="number"
              required
              helperText={p.hint}
              error={form.formState.errors[p.key]?.message}
              {...form.register(p.key)}
            />
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setSlaTarget(null)}>Cancel</Button>
            <Button size="sm" type="submit" loading={saveSLA.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
