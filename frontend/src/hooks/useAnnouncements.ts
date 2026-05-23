import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Announcement, Event, Notification } from '@/types/announcement'

interface AnnouncementFilters {
  category?: string
  priority?: string
  page?: number
}

// ─── Backend → Frontend normalizers ──────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(raw: any): Event {
  const eventDate = raw.eventDate ?? raw.event_date ?? raw.date ?? ''
  const dateObj = eventDate ? new Date(eventDate) : null

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    date: dateObj ? dateObj.toISOString().split('T')[0] : '',
    time: dateObj
      ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '',
    location: raw.location,
    capacity: raw.capacity,
    registered_count: raw._count?.registrations ?? raw.registered_count ?? 0,
    is_registered: raw.is_registered ?? false,
    is_cancelled: raw.isCancelled ?? raw.is_cancelled ?? false,
    organizer: {
      id: raw.creator?.id ?? raw.organizer?.id ?? '',
      name: raw.creator?.fullName ?? raw.creator?.name ?? raw.organizer?.name ?? 'City',
      department: raw.department?.name ?? raw.organizer?.department ?? '',
    },
    created_at: raw.createdAt ?? raw.created_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnnouncement(raw: any): Announcement {
  return {
    id: raw.id,
    title: raw.title,
    body: raw.body ?? raw.content ?? '',
    category: raw.category,
    priority: raw.priority,
    author: {
      id: raw.author?.id ?? raw.createdBy ?? '',
      name: raw.author?.fullName ?? raw.author?.name ?? raw.author_name ?? 'City',
      department: raw.author?.department?.name ?? raw.department?.name ?? '',
    },
    expiry_date: raw.expiryDate ?? raw.expiry_date,
    is_read: raw.is_read ?? raw.isRead ?? false,
    created_at: raw.createdAt ?? raw.created_at ?? '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNotification(raw: any): Notification {
  // Map backend notification types to frontend types
  const typeMap: Record<string, Notification['type']> = {
    ticket_status_change: 'status_change',
    ticket_comment: 'status_change',
    ticket_assigned: 'status_change',
    permit_status_change: 'permit_update',
    permit_approved: 'permit_update',
    permit_rejected: 'permit_update',
    announcement_published: 'announcement',
    sla_breach_alert: 'sla_alert',
    event_registration_confirmed: 'event',
    // pass-through if already normalized
    status_change: 'status_change',
    sla_alert: 'sla_alert',
    announcement: 'announcement',
    event: 'event',
    permit_update: 'permit_update',
  }

  return {
    id: raw.id,
    type: typeMap[raw.type] ?? 'status_change',
    title: raw.title ?? raw.type ?? '',
    message: raw.message,
    link: raw.link ?? raw.reference_url,
    is_read: raw.isRead ?? raw.is_read ?? false,
    created_at: raw.createdAt ?? raw.created_at ?? '',
  }
}

export const useAnnouncements = (filters: AnnouncementFilters = {}) =>
  useQuery({
    queryKey: ['announcements', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>('/announcements', { params: filters })
      return (data.data ?? []).map(normalizeAnnouncement)
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
      const { data } = await api.get<{ data: unknown[] }>('/events', { params: filters })
      return (data.data ?? []).map(normalizeEvent)
    },
  })

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown }>(`/events/${id}`)
      return normalizeEvent(data.data)
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
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useUnregisterFromEvent = (eventId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${eventId}/register`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId] })
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useNotifications = (params: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>('/notifications', { params })
      return (data.data ?? []).map(normalizeNotification)
    },
  })
