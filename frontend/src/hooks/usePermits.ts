import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { PermitApplication, PermitListItem, PermitTypeInfo } from '@/types/permit'

export const usePermitTypes = () =>
  useQuery({
    queryKey: ['permits', 'types'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermitTypeInfo[] }>('/permits/types')
      return data.data
    },
  })

export const useMyPermits = () =>
  useQuery({
    queryKey: ['permits', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermitListItem[] }>('/permits')
      return data.data
    },
  })

export const usePermit = (id: string) =>
  useQuery({
    queryKey: ['permits', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: PermitApplication }>(`/permits/${id}`)
      return data.data
    },
    enabled: !!id,
  })

export const useCreatePermit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<{ data: PermitApplication }>('/permits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
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
      const { data } = await api.patch(`/permits/${permitId}/status`, payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits', permitId] })
      qc.invalidateQueries({ queryKey: ['permits', 'mine'] })
    },
  })
}
