'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermitWizard } from '@/components/permits/PermitWizard'
import { FeeCalculator } from '@/components/permits/FeeCalculator'
import { Input, Select } from '@/components/common/Input'
import { useCreatePermit } from '@/hooks/usePermits'
import type { PermitType } from '@/types/permit'
import toast from 'react-hot-toast'

const permitLabels: Record<PermitType, string> = {
  construction: 'Construction Permit',
  event: 'Event Permit',
  business_license: 'Business License Renewal',
}

// ── Event Permit schemas ──────────────────────────────────────────────────────
const step1Schema = z.object({
  event_name: z.string().min(3, 'Event name is required'),
  organizer_name: z.string().min(2, 'Organizer name is required'),
  contact_email: z.string().email('Enter a valid email'),
  crowd_size: z.coerce.number().int().min(10, 'Minimum 10').max(100000, 'Maximum 100,000'),
})

const step2Schema = z.object({
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  venue_name: z.string().min(2, 'Venue name is required'),
  venue_address: z.string().min(5, 'Venue address is required'),
  venue_type: z.enum(['indoor', 'outdoor']),
  noise_ordinance: z.boolean().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export default function PermitApplicationPage() {
  const params = useParams<{ type: string }>()
  const rawType = Array.isArray(params?.type) ? params.type[0] : (params?.type ?? '')
  const router = useRouter()
  const permitType = rawType as PermitType
  const isValidType = rawType in permitLabels
  const createPermit = useCreatePermit()

  const [docs, setDocs] = useState<File[]>([])
  const [docError, setDocError] = useState('')

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), mode: 'onChange' })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), mode: 'onChange' })

  const venueType = form2.watch('venue_type')
  const crowdSize = form1.watch('crowd_size') || 0

  // Guard against invalid permit type
  if (!isValidType) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Invalid permit type. Please go back and select a valid permit.</p>
      </div>
    )
  }

  // Fee calculation (client-side preview)
  const baseFee = 5000
  const crowdFee = Math.floor(crowdSize / 100) * 100
  const feeBreakdown = [
    { label: 'Base Fee', amount: baseFee },
    { label: `Crowd Charge (${crowdSize} attendees)`, amount: crowdFee },
  ]
  const totalFee = baseFee + crowdFee

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024)
    if (oversized.length) {
      setDocError(`File "${oversized[0].name}" exceeds 10 MB limit.`)
      return
    }
    setDocError('')
    setDocs((prev) => [...prev, ...files].slice(0, 5))
  }

  const handleSubmit = async () => {
    const data1 = form1.getValues()
    const data2 = form2.getValues()
    if (docs.length === 0) {
      toast.error('Please upload at least one document.')
      return
    }
    try {
      const formData = new FormData()
      formData.append('permit_type', permitType)
      Object.entries({ ...data1, ...data2 }).forEach(([k, v]) => {
        formData.append(k, String(v))
      })
      docs.forEach((f) => formData.append('documents', f))
      const permit = await createPermit.mutateAsync(formData)
      toast.success(`Application ${permit.application_number} submitted!`)
      router.push(`/permits/${permit.id}`)
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  const steps = [
    {
      id: 1,
      label: 'Basic Info',
      isValid: form1.formState.isValid,
      component: (
        <div className="space-y-4">
          <Input label="Event Name" required error={form1.formState.errors.event_name?.message} {...form1.register('event_name')} />
          <Input label="Organizer Name" required error={form1.formState.errors.organizer_name?.message} {...form1.register('organizer_name')} />
          <Input label="Contact Email" type="email" required error={form1.formState.errors.contact_email?.message} {...form1.register('contact_email')} />
          <Input label="Expected Crowd Size" type="number" required helperText="Min 10, max 100,000" error={form1.formState.errors.crowd_size?.message} {...form1.register('crowd_size')} />
        </div>
      ),
    },
    {
      id: 2,
      label: 'Event Details',
      isValid: form2.formState.isValid,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Date" type="date" required error={form2.formState.errors.event_date?.message} {...form2.register('event_date')} />
            <Input label="Event Time" type="text" placeholder="e.g. 6:00 PM" required error={form2.formState.errors.event_time?.message} {...form2.register('event_time')} />
          </div>
          <Input label="Venue Name" required error={form2.formState.errors.venue_name?.message} {...form2.register('venue_name')} />
          <Input label="Venue Address" required error={form2.formState.errors.venue_address?.message} {...form2.register('venue_address')} />
          <Select
            label="Venue Type"
            required
            options={[{ value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' }]}
            value={form2.watch('venue_type') || ''}
            onChange={(v) => form2.setValue('venue_type', v as 'indoor' | 'outdoor', { shouldValidate: true })}
            error={form2.formState.errors.venue_type?.message}
          />
          {venueType === 'outdoor' && (
            <label className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-primary-700"
                {...form2.register('noise_ordinance')}
              />
              <span className="text-sm text-amber-800">
                I acknowledge the city noise ordinance and agree to comply with sound level limits for outdoor events.
              </span>
            </label>
          )}
        </div>
      ),
    },
    {
      id: 3,
      label: 'Documents',
      isValid: docs.length > 0,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload required documents (PDF or image, max 10 MB each).</p>
          <div className="space-y-3">
            {[
              { label: 'Venue Agreement', required: true },
              { label: 'Event Plan / Programme', required: true },
              { label: 'Additional Documents', required: false },
            ].map((doc) => (
              <div key={doc.label}>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {doc.label} {doc.required && <span className="text-danger">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleDocUpload}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            ))}
          </div>
          {docError && <p className="text-sm text-danger">{docError}</p>}
          {docs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {docs.map((f, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                  {f.name}
                  <button type="button" onClick={() => setDocs((d) => d.filter((_, j) => j !== i))} className="text-gray-400 hover:text-danger ml-1" aria-label={`Remove ${f.name}`}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 4,
      label: 'Review & Submit',
      isValid: true,
      component: (
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
            {Object.entries({ ...form1.getValues(), ...form2.getValues() }).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900 text-right">{String(v)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Documents</span>
              <span className="font-medium text-gray-900">{docs.length} file(s)</span>
            </div>
          </div>
          <FeeCalculator breakdown={feeBreakdown} total={totalFee} />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            A payment receipt will be generated upon submission. Actual payment processing is handled at the department office.
          </div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={permitLabels[permitType] || 'Permit Application'}
        subtitle="Complete all steps to submit your application."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Permits', href: '/permits' },
          { label: permitLabels[permitType] || 'Apply' },
        ]}
      />
      <PermitWizard
        steps={steps}
        onSubmit={handleSubmit}
        isSubmitting={createPermit.isPending}
      />
    </div>
  )
}
