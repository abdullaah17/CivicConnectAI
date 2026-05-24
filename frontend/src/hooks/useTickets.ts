import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
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
  low:       'low',
  medium:    'medium',
  high:      'high',
  emergency: 'emergency',
  Low:       'low',
  Medium:    'medium',
  High:      'high',
  Emergency: 'emergency',
}

function normalizeStatus(s: string): TicketStatus {
  return STATUS_MAP[s] ?? (s as TicketStatus)
}

function normalizePriority(p: string): TicketPriority {
  return PRIORITY_MAP[p] ?? (p as TicketPriority)
}

function toBackendStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '_')
}

function toBackendPriority(priority: string): string {
  return priority.toLowerCase()
}

function normalizeTicketFilters(filters: TicketFilters): TicketFilters {
  return {
    ...filters,
    status: filters.status ? toBackendStatus(filters.status) : undefined,
    priority: filters.priority ? toBackendPriority(filters.priority) : undefined,
  }
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
export const useMyTickets = (filters: TicketFilters = {}) => {
  const { isAuthenticated, _hasHydrated, accessToken, user } = useAuthStore()
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', { params: normalizeTicketFilters(filters) })
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
    },
    enabled: isAuthenticated && _hasHydrated && !!accessToken && !!user,
  })
}

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
export const useStaffQueue = (filters: TicketFilters = {}) => {
  const { isAuthenticated, _hasHydrated, accessToken, user } = useAuthStore()
  return useQuery({
    queryKey: ['tickets', 'assigned', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', {
        params: { ...normalizeTicketFilters(filters), assigned_to_me: true },
      })
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
    },
    enabled: isAuthenticated && _hasHydrated && !!accessToken && !!user,
  })
}

// Admin: all dept tickets
export const useDeptTickets = (deptId: string, filters: TicketFilters = {}) =>
  useQuery({
    queryKey: ['tickets', 'department', { deptId, ...filters }],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedTickets }>('/tickets', {
        params: { department_id: deptId, ...normalizeTicketFilters(filters) },
      })
      const raw = data.data
      return {
        ...raw,
        tickets: raw.tickets.map(normalizeTicketListItem),
      }
    },
    enabled: !!deptId,
  })

// Ticket stats — residents hit /my-stats (their own tickets only);
// staff/admin hit /stats (department-wide)
export const useTicketStats = () => {
  const { isAuthenticated, _hasHydrated, accessToken, user } = useAuthStore()
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: async () => {
      const endpoint = user?.role === 'resident' ? '/tickets/my-stats' : '/tickets/stats'
      const { data } = await api.get<{ data: TicketStats }>(endpoint)
      return data.data
    },
    enabled: isAuthenticated && _hasHydrated && !!accessToken && !!user,
    staleTime: 30_000,
  })
}

// Upload a single attachment file to Cloudinary via the backend
// Returns the public URL string.
// NOTE: Do NOT set Content-Type manually — axios sets the correct
// multipart/form-data boundary automatically when given a FormData body.
async function uploadAttachment(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<{ data: { url: string; file_url?: string } }>(
    '/tickets/upload',
    fd
    // No explicit Content-Type header — axios handles multipart boundary
  )
  // Backend may return { url } or { file_url }
  return data.data.url ?? data.data.file_url ?? ''
}

// Slugify a human-readable category label → snake_case for the backend
// e.g. "Street Lighting" → "street_lighting", "Road Damage" → "road_damage"
function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')   // strip special chars
    .replace(/\s+/g, '_')           // spaces → underscores
}

// Create ticket
export const useCreateTicket = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      const { attachments = [], ...fields } = payload

      // Step 1 — upload files in parallel (if any)
      // Each file is uploaded to Cloudinary via /tickets/upload; URLs are then
      // passed as attachment_urls[] in the ticket body (Backend PRD §4.3 B-A01)
      const attachmentUrls: string[] = attachments.length
        ? await Promise.all(attachments.map(uploadAttachment))
        : []

      // Step 2 — build JSON body with backend-expected field shapes
      const body: Record<string, unknown> = {
        ...fields,
        // Backend DB enum is lowercase: 'low' | 'medium' | 'high' | 'emergency'
        priority: fields.priority.toLowerCase(),
        // Backend expects snake_case category slug, not human-readable label
        category: slugifyCategory(fields.category),
      }
      if (attachmentUrls.length) {
        // Backend PRD §4.3: attachment URLs passed as array field
        body.attachment_urls = attachmentUrls
      }

      if (process.env.NODE_ENV === 'development') {
        console.info('[Submit Request] POST /tickets payload', body)
      }

      try {
        const { data } = await api.post<{ data: Ticket }>('/tickets', body)
        return normalizeTicket(data.data)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Submit Request] POST /tickets failed', {
            status: isAxiosError(err) ? err.response?.status : undefined,
            data: isAxiosError(err) ? err.response?.data : undefined,
            message: err instanceof Error ? err.message : String(err),
          })
        }
        throw err
      }
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
