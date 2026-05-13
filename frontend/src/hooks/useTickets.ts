import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Ticket, TicketListItem, TicketStats, CreateTicketPayload } from '@/types/ticket'

interface TicketFilters {
  status?: string
  priority?: string
  department_id?: string
  page?: number
  limit?: number
}

interface PaginatedTickets {
  tickets: TicketListItem[]
  total: number
  page: number
  limit: number
}

// Resident: my tickets
export const useMyTickets = (filters: TicketFilters = {}) =>
  useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', { params: filters })
      return data.data
    },
  })

// Single ticket detail
export const useTicket = (ticketId: string) =>
  useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Ticket }>(`/tickets/${ticketId}`)
      return data.data
    },
    enabled: !!ticketId,
  })

// Staff: assigned queue
export const useStaffQueue = (filters: TicketFilters = {}) =>
  useQuery({
    queryKey: ['tickets', 'assigned', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', {
        params: { ...filters, assigned_to_me: true },
      })
      return data.data
    },
  })

// Admin: all dept tickets
export const useDeptTickets = (deptId: string, filters: TicketFilters = {}) =>
  useQuery({
    queryKey: ['tickets', 'department', { deptId, ...filters }],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', {
        params: { department_id: deptId, ...filters },
      })
      return data.data
    },
    enabled: !!deptId,
  })

// Ticket stats
export const useTicketStats = () =>
  useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: TicketStats }>('/tickets/stats')
      return data.data
    },
  })

// Create ticket
export const useCreateTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, val]) => {
        if (key === 'attachments' && Array.isArray(val)) {
          val.forEach((file) => formData.append('attachments', file))
        } else if (val !== undefined) {
          formData.append(key, String(val))
        }
      })
      const { data } = await api.post<{ data: Ticket }>('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

// Update ticket status
export const useUpdateTicketStatus = (ticketId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { status: string; public_note?: string }) => {
      const { data } = await api.patch(`/tickets/${ticketId}/status`, payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', ticketId] })
      qc.invalidateQueries({ queryKey: ['tickets', 'assigned'] })
      qc.invalidateQueries({ queryKey: ['analytics', 'tickets'] })
    },
  })
}

// Add comment
export const useAddComment = (ticketId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { body: string; is_internal: boolean }) => {
      const { data } = await api.post(`/tickets/${ticketId}/comments`, payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', ticketId] })
    },
  })
}

// Assign ticket
export const useAssignTicket = (ticketId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (staffId: string) => {
      const { data } = await api.patch(`/tickets/${ticketId}/assign`, { staff_id: staffId })
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', ticketId] })
      qc.invalidateQueries({ queryKey: ['tickets', 'department'] })
    },
  })
}
