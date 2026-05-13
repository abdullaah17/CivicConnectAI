import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Announcement, Event, Notification } from '@/types/announcement'

interface AnnouncementFilters {
  category?: string
  priority?: string
  page?: number
}

export const useAnnouncements = (filters: AnnouncementFilters = {}) =>
  useQuery({
    queryKey: ['announcements', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: Announcement[] }>('/announcements', { params: filters })
      return data.data
    },
  })

export const useMarkAnnouncementRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/announcements/${id}/read`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

export const useEvents = (filters: { category?: string; date_from?: string; date_to?: string; page?: number } = {}) =>
  useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: Event[] }>('/events', { params: filters })
      return data.data
    },
  })

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Event }>(`/events/${id}`)
      return data.data
    },
    enabled: !!id,
  })

export const useRegisterForEvent = (eventId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post(`/events/${eventId}/register`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export const useNotifications = (params: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<{ data: Notification[] }>('/notifications', { params })
      return data.data
    },
  })
