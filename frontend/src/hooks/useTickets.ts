import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Ticket, TicketListItem, TicketStats, CreateTicketPayload, TicketStatus, TicketPriority } from '@/types/ticket'

// ─── Backend → Frontend normalizers ──────────────────────────────────────────
// The backend uses lowercase/snake_case enums; the frontend expects Title Case.

const STATUS_MAP: Record<string, TicketStatus> = {
  submitted:    'Submitted',
  under_review: 'Under Review',
  assigned:     'Assigned',
  in_progress:  'In Progress',
  resolved:     'Resolved',
  closed:       'Closed',
  // pass-through if already normalised
  Submitted:    'Submitted',
  'Under Review': 'Under Review',
  Assigned:     'Assigned',
  'In Progress': 'In Progress',
  Resolved:     'Resolved',
  Closed:       'Closed',
}

const PRIORITY_MAP: Record<string, TicketPriority> = {
  low:       'Low',
  medium:    'Medium',
  high:      'High',
  emergency: 'Emergency',
  Low:       'Low',
  Medium:    'Medium',
  High:      'High',
  Emergency: 'Emergency',
}

function normalizeStatus(s: string): TicketStatus {
  return STATUS_MAP[s] ?? (s as TicketStatus)
}

function normalizePriority(p: string): TicketPriority {
  return PRIORITY_MAP[p] ?? (p as TicketPriority)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTicket(raw: any): Ticket {
  return {
    ...raw,
    // Normalize camelCase → snake_case from backend
    ticket_number:   raw.ticket_number   ?? raw.ticketNumber   ?? '',
    department_name: raw.department_name ?? raw.department?.name ?? '',
    department_id:   raw.department_id   ?? raw.departmentId   ?? '',
    sla_deadline:    raw.sla_deadline    ?? raw.slaDeadline    ?? '',
    created_at:      raw.created_at      ?? raw.createdAt      ?? '',
    updated_at:      raw.updated_at      ?? raw.updatedAt      ?? '',
    submitted_by: raw.submitted_by ?? {
      id:                raw.resident?.id ?? raw.residentId ?? '',
      name:              raw.resident?.fullName ?? raw.resident?.name ?? '',
      email:             raw.resident?.email ?? '',
      profile_photo_url: raw.resident?.profilePhotoUrl ?? raw.resident?.profile_photo_url,
    },
    assigned_to: raw.assigned_to ?? (raw.assignedTo ? {
      id:   raw.assignedTo.id,
      name: raw.assignedTo.fullName ?? raw.assignedTo.name ?? '',
    } : undefined),
    attachments: (raw.attachments ?? []).map((a: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
      id:        a.id,
      url:       a.url ?? a.file_url ?? a.fileUrl ?? '',
      filename:  a.filename ?? a.file_name ?? a.fileName ?? '',
      mime_type: a.mime_type ?? a.mimeType ?? a.file_type ?? '',
      size:      a.size ?? 0,
    })),
    comments: (raw.comments ?? []).map((c: any) => ({  // eslint-disable-line @typescript-eslint/no-explicit-any
      ...c,
      is_internal: c.is_internal ?? c.isInternal ?? false,
      created_at:  c.created_at  ?? c.createdAt  ?? '',
      author: {
        id:                c.author?.id ?? c.authorId ?? '',
        name:              c.author?.fullName ?? c.author?.name ?? '',
        role:              c.author?.role ?? '',
        profile_photo_url: c.author?.profilePhotoUrl ?? c.author?.profile_photo_url,
      },
    })),
    status:   normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
    // Normalize nested status history entries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status_history: (raw.status_history ?? raw.statusHistory ?? []).map((h: any) => ({
      ...h,
      from_status: h.from_status ?? h.fromStatus
        ? normalizeStatus(h.from_status ?? h.fromStatus)
        : null,
      to_status:   normalizeStatus(h.to_status ?? h.toStatus ?? ''),
      created_at:  h.created_at ?? h.changedAt ?? h.createdAt ?? '',
      actor: {
        id:   h.actor?.id ?? h.changedBy?.id ?? '',
        name: h.actor?.fullName ?? h.actor?.name ?? h.changedBy?.fullName ?? h.changedBy?.name ?? '',
        role: h.actor?.role ?? h.changedBy?.role ?? '',
      },
      public_note: h.public_note ?? h.note ?? h.publicNote,
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTicketListItem(raw: any): TicketListItem {
  return {
    ...raw,
    ticket_number:   raw.ticket_number   ?? raw.ticketNumber   ?? '',
    department_name: raw.department_name ?? raw.department?.name ?? '',
    sla_deadline:    raw.sla_deadline    ?? raw.slaDeadline    ?? '',
    created_at:      raw.created_at      ?? raw.createdAt      ?? '',
    assigned_to: raw.assigned_to ?? (raw.assignedTo ? {
      id:   raw.assignedTo.id,
      name: raw.assignedTo.fullName ?? raw.assignedTo.name ?? '',
    } : undefined),
    status:   normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
  }
}

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
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
    },
  })

// Single ticket detail
export const useTicket = (ticketId: string) =>
  useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Ticket }>(`/tickets/${ticketId}`)
      return normalizeTicket(data.data)
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
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
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
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
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

// Upload a single attachment file to Cloudinary via the backend
// Returns the public URL string
async function uploadAttachment(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<{ data: { url: string; file_url?: string } }>(
    '/tickets/upload',
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  // Backend may return { url } or { file_url }
  return data.data.url ?? data.data.file_url ?? ''
}

// Create ticket
export const useCreateTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      const { attachments = [], ...fields } = payload

      // Step 1 — upload files in parallel (if any)
      const attachmentUrls: string[] = attachments.length
        ? await Promise.all(attachments.map(uploadAttachment))
        : []

      // Step 2 — create ticket with JSON body
      const body: Record<string, unknown> = {
        ...fields,
        priority: fields.priority.toLowerCase(), // backend expects lowercase
      }
      if (attachmentUrls.length) {
        body.attachment_urls = attachmentUrls
      }

      const { data } = await api.post<{ data: Ticket }>('/tickets', body)
      return normalizeTicket(data.data)
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
      // Backend expects lowercase snake_case status
      const backendStatus = payload.status.toLowerCase().replace(/ /g, '_')
      const { data } = await api.patch(`/tickets/${ticketId}/status`, {
        ...payload,
        status: backendStatus,
      })
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
