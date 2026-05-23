'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { useQuery } from '@tanstack/react-query'
import { Upload, X, AlertTriangle, Zap, ArrowUp, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/common/Button'
import { Input, Textarea, Select } from '@/components/common/Input'
import { ticketSchema, type TicketFormData } from '@/utils/validators'
import { AISuggest } from '@/components/tickets/AISuggest'
import { SkeletonCard } from '@/components/common/SkeletonLoader'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import dynamic from 'next/dynamic'
import type { TicketPriority } from '@/types/ticket'

const LocationPicker = dynamic(
  () => import('@/components/common/LocationPicker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="w-full h-56 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" /> }
)

interface Department {
  id: string
  name: string
  code: string
}

// Categories keyed by department name (case-insensitive match)
const CATEGORIES_BY_NAME: Record<string, string[]> = {
  'infrastructure':       ['Street Lighting', 'Road Damage', 'Water Supply', 'Sewage', 'Parks & Recreation', 'Other'],
  'permits & licensing':  ['Construction Permit', 'Event Permit', 'Business License', 'Signage Permit', 'Other'],
  'health & sanitation':  ['Waste Collection', 'Pest Control', 'Food Safety', 'Water Quality', 'Other'],
  'public safety':        ['Traffic', 'Street Crime', 'Fire Hazard', 'Noise Complaint', 'Other'],
  'environment':          ['Air Quality', 'Illegal Dumping', 'Tree Removal', 'Flooding', 'Other'],
  'education':            ['School Facility', 'Transport', 'Curriculum', 'Other'],
}

// Fallback categories for any department not in the map above
const DEFAULT_CATEGORIES = ['General Complaint', 'Service Request', 'Maintenance', 'Emergency', 'Other']

function getCategoriesForDept(deptName: string): string[] {
  const key = deptName.toLowerCase()
  // Exact match first
  if (CATEGORIES_BY_NAME[key]) return CATEGORIES_BY_NAME[key]
  // Partial match
  const partial = Object.keys(CATEGORIES_BY_NAME).find((k) => key.includes(k) || k.includes(key))
  return partial ? CATEGORIES_BY_NAME[partial] : DEFAULT_CATEGORIES
}

// Department icons by name keyword
function getDeptIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('infra') || n.includes('road') || n.includes('public works')) return '🏗️'
  if (n.includes('permit') || n.includes('licens')) return '📋'
  if (n.includes('health') || n.includes('sanit')) return '🏥'
  if (n.includes('safety') || n.includes('police') || n.includes('fire')) return '🚨'
  if (n.includes('environ') || n.includes('green')) return '🌿'
  if (n.includes('edu') || n.includes('school')) return '🎓'
  if (n.includes('water')) return '💧'
  if (n.includes('transport') || n.includes('traffic')) return '🚦'
  return '🏛️'
}

const PRIORITIES: { value: TicketPriority; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { value: 'Low',       label: 'Low',       description: 'Non-urgent, can wait',       icon: <Minus className="w-4 h-4" />,         color: 'border-gray-300 text-gray-600' },
  { value: 'Medium',    label: 'Medium',    description: 'Needs attention soon',        icon: <ArrowUp className="w-4 h-4" />,        color: 'border-blue-300 text-blue-600' },
  { value: 'High',      label: 'High',      description: 'Urgent, affects daily life',  icon: <AlertTriangle className="w-4 h-4" />,  color: 'border-amber-400 text-amber-600' },
  { value: 'Emergency', label: 'Emergency', description: 'Immediate danger or hazard',  icon: <Zap className="w-4 h-4" />,            color: 'border-danger text-danger' },
]

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5

interface TicketFormProps {
  onSubmit: (data: TicketFormData, files: File[]) => Promise<void>
  isSubmitting?: boolean
}

export const TicketForm = ({ onSubmit, isSubmitting }: TicketFormProps) => {
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | ''>('')

  // Fetch real departments from the backend
  const { data: departments, isLoading: deptsLoading, isError: deptsError } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments')
      return data.data as Department[]
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
    retry: 2,
    enabled: isAuthenticated && _hasHydrated,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  })

  const selectedDeptId = watch('department_id')
  const selectedDept = departments?.find((d) => d.id === selectedDeptId)
  const categoryOptions = selectedDept
    ? getCategoriesForDept(selectedDept.name).map((c) => ({ value: c, label: c }))
    : []

  const onDrop = useCallback((accepted: File[], rejected: import('react-dropzone').FileRejection[]) => {
    const newErrors: string[] = []

    rejected.forEach(({ file, errors: errs }) => {
      errs.forEach((err) => {
        if (err.code === 'file-too-large') {
          newErrors.push(`"${file.name}" is too large. Maximum size is 10 MB.`)
        } else if (err.code === 'file-invalid-type') {
          newErrors.push(`"${file.name}" is not supported. Please upload PDF, JPG, PNG, or WEBP.`)
        }
      })
    })

    const combined = [...files, ...accepted]
    if (combined.length > MAX_FILES) {
      newErrors.push(`You can attach up to ${MAX_FILES} files. Please remove some.`)
      setFileErrors(newErrors)
      return
    }

    setFiles(combined)
    setFileErrors(newErrors)
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: TicketFormData) => {
    await onSubmit(data, files)
  }

  if (!_hasHydrated || deptsLoading) {
    return <SkeletonCard />
  }

  if (deptsError || !departments?.length) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-sm text-danger">
          Unable to load departments. Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary-700 underline hover:text-primary-900"
        >
          Reload page
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* Department */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 font-display mb-3">
          Department <span className="text-danger" aria-hidden="true">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <label
              key={dept.id}
              className={clsx(
                'flex items-center gap-3 p-3 rounded border-2 cursor-pointer transition-colors',
                'hover:border-primary-500 min-h-[44px]',
                selectedDeptId === dept.id
                  ? 'border-primary-700 bg-primary-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <input
                type="radio"
                value={dept.id}
                {...register('department_id')}
                onChange={() => {
                  setValue('department_id', dept.id, { shouldValidate: true })
                  setValue('category', '')
                }}
                className="sr-only"
              />
              <span className="text-xl" aria-hidden="true">{getDeptIcon(dept.name)}</span>
              <span className="text-sm font-medium text-gray-700">{dept.name}</span>
            </label>
          ))}
        </div>
        {errors.department_id && (
          <p role="alert" className="mt-1 text-sm text-danger">{errors.department_id.message}</p>
        )}
      </fieldset>

      {/* Title */}
      <Input
        label="Title"
        placeholder="Brief description of the issue"
        required
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Provide as much detail as possible about the issue..."
        required
        maxLength={1000}
        showCount
        error={errors.description?.message}
        {...register('description')}
      />

      {/* AI Category Suggestion */}
      <AISuggest
        description={watch('description') || ''}
        onAccept={(departmentId, category) => {
          setValue('department_id', departmentId, { shouldValidate: true })
          setValue('category', category, { shouldValidate: true })
        }}
      />

      {/* Category */}
      <Select
        label="Category"
        placeholder="Select a category"
        required
        options={categoryOptions}
        value={watch('category') || ''}
        onChange={(v) => setValue('category', v, { shouldValidate: true })}
        disabled={!selectedDeptId}
        error={errors.category?.message}
        helperText={!selectedDeptId ? 'Select a department first' : undefined}
      />

      {/* Location */}
      <Input
        label="Location"
        placeholder="e.g. Canal Road, near Sector F-7"
        required
        error={errors.location?.message}
        {...register('location')}
      />

      {/* Map pin (optional enhancement) */}
      <LocationPicker
        value={watch('location')}
        onChange={(addr) => setValue('location', addr, { shouldValidate: true })}
      />

      {/* Priority */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 font-display mb-3">
          Priority <span className="text-danger" aria-hidden="true">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRIORITIES.map((p) => (
            <label
              key={p.value}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-3 rounded border-2 cursor-pointer transition-colors text-center',
                'hover:border-primary-500 min-h-[44px]',
                selectedPriority === p.value
                  ? `border-current bg-opacity-10 ${p.color}`
                  : 'border-gray-200 bg-white text-gray-600'
              )}
            >
              <input
                type="radio"
                value={p.value}
                {...register('priority')}
                onChange={() => {
                  setValue('priority', p.value, { shouldValidate: true })
                  setSelectedPriority(p.value)
                }}
                className="sr-only"
              />
              <span aria-hidden="true">{p.icon}</span>
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="text-xs text-gray-500 leading-tight">{p.description}</span>
            </label>
          ))}
        </div>
        {errors.priority && (
          <p role="alert" className="mt-1 text-sm text-danger">{errors.priority.message}</p>
        )}
      </fieldset>

      {/* File upload */}
      <div>
        <p className="text-sm font-semibold text-gray-700 font-display mb-2">
          Attachments <span className="text-gray-400 font-normal">(optional, max 5 files, 10 MB each)</span>
        </p>
        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            'min-h-[120px] flex flex-col items-center justify-center gap-2',
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 bg-gray-50'
          )}
          role="button"
          aria-label="Upload files. Click or drag and drop."
          tabIndex={0}
        >
          <input {...getInputProps()} aria-label="File upload input" />
          <Upload className="w-8 h-8 text-gray-400" aria-hidden="true" />
          <p className="text-sm text-gray-600">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG, WEBP — max 10 MB each</p>
        </div>

        {/* File errors */}
        {fileErrors.map((err, i) => (
          <p key={i} role="alert" className="mt-1 text-sm text-danger">{err}</p>
        ))}

        {/* File previews */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 text-sm text-gray-700"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-danger transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full sm:w-auto"
        >
          Submit Request
        </Button>
      </div>
    </form>
  )
}
