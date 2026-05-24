import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { samplePermits, shouldUseSampleData } from '@/utils/sampleData'
import type { PermitApplication, PermitListItem, PermitStatus, PermitType, PermitTypeInfo } from '@/types/permit'

const PERMIT_STATUS_MAP: Record<string, PermitStatus> = {
  draft: 'Draft',
  submitted: 'Submitted',
  document_verification: 'Document Verification',
  field_inspection_scheduled: 'Inspection Scheduled',
  inspection_scheduled: 'Inspection Scheduled',
  approved: 'Approved',
  rejected: 'Rejected',
  Draft: 'Draft',
  Submitted: 'Submitted',
  'Document Verification': 'Document Verification',
  'Inspection Scheduled': 'Inspection Scheduled',
  Approved: 'Approved',
  Rejected: 'Rejected',
}

function normalizePermitStatus(status: string): PermitStatus {
  return PERMIT_STATUS_MAP[status] ?? (status as PermitStatus)
}

function toBackendPermitStatus(status: string): string {
  const statusMap: Record<string, string> = {
    Draft: 'draft',
    Submitted: 'submitted',
    'Document Verification': 'document_verification',
    'Inspection Scheduled': 'field_inspection_scheduled',
    Approved: 'approved',
    Rejected: 'rejected',
  }
  return statusMap[status] ?? status.toLowerCase().replace(/\s+/g, '_')
}

function normalizePermitType(type: string): PermitType {
  const typeMap: Record<string, PermitType> = {
    construction: 'construction_permit',
    event: 'event_permit',
    business_license: 'business_license_renewal',
    construction_permit: 'construction_permit',
    event_permit: 'event_permit',
    business_license_renewal: 'business_license_renewal',
  }
  return typeMap[type] ?? (type as PermitType)
}

function normalizePermitListItem(raw: PermitListItem): PermitListItem {
  return {
    ...raw,
    permit_type: normalizePermitType(raw.permit_type),
    status: normalizePermitStatus(raw.status),
  }
}

function normalizePermitApplication(raw: PermitApplication): PermitApplication {
  return {
    ...raw,
    permit_type: normalizePermitType(raw.permit_type),
    status: normalizePermitStatus(raw.status),
  }
}

export const usePermitTypes = () =>
  useQuery({
    queryKey: ['permits', 'types'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermitTypeInfo[] }>('/permits/types')
      return data.data
    },
  })

export const useMyPermits = () => {
  const { isAuthenticated, _hasHydrated, accessToken, user } = useAuthStore()
  return useQuery({
    queryKey: ['permits', 'mine'],
    queryFn: async () => {
      // Use sample data if API is not available
      if (shouldUseSampleData()) {
        return samplePermits.map(normalizePermitListItem)
      }

      const { data } = await api.get<{ data: PermitListItem[] }>('/permits')
      return data.data.map(normalizePermitListItem)
    },
    enabled: isAuthenticated && _hasHydrated && !!accessToken && !!user,
  })
}

export const usePermit = (id: string) =>
  useQuery({
    queryKey: ['permits', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermitApplication }>(`/permits/${id}`)
      return normalizePermitApplication(data.data)
    },
    enabled: !!id,
  })

export const useCreatePermit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<{ data: PermitApplication }>('/permits', formData)
      return normalizePermitApplication(data.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits', 'mine'] })
    },
  })
}

export const useSaveDraft = (permitId: string) =>
  useMutation({
    mutationFn: async (partialData: Record<string, unknown>) => {
      const { data } = await api.patch(`/permits/${permitId}/draft`, partialData)
      return data.data
    },
  })

export const useSubmitPermit = (permitId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/permits/${permitId}/submit`)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits', permitId] })
      qc.invalidateQueries({ queryKey: ['permits', 'mine'] })
    },
  })
}

export const useUpdatePermitStatus = (permitId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { status: string; rejection_reason?: string }) => {
      const { data } = await api.patch(`/permits/${permitId}/status`, {
        ...payload,
        status: toBackendPermitStatus(payload.status),
      })
      return normalizePermitApplication(data.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits', permitId] })
      qc.invalidateQueries({ queryKey: ['permits', 'mine'] })
    },
  })
}
