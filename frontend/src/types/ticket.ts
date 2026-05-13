export type TicketStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Emergency'

export interface Attachment {
  id: string
  url: string
  filename: string
  mime_type: string
  size: number
}

export interface Comment {
  id: string
  ticket_id: string
  author: {
    id: string
    name: string
    role: string
    profile_photo_url?: string
  }
  body: string
  is_internal: boolean
  created_at: string
}

export interface StatusHistoryEntry {
  id: string
  from_status: TicketStatus | null
  to_status: TicketStatus
  actor: {
    id: string
    name: string
    role: string
  }
  public_note?: string
  created_at: string
}

export interface Ticket {
  id: string
  ticket_number: string
  title: string
  description: string
  department_id: string
  department_name: string
  category: string
  location: string
  priority: TicketPriority
  status: TicketStatus
  submitted_by: {
    id: string
    name: string
    email: string
    profile_photo_url?: string
  }
  assigned_to?: {
    id: string
    name: string
    profile_photo_url?: string
  }
  sla_deadline: string
  attachments: Attachment[]
  comments: Comment[]
  status_history: StatusHistoryEntry[]
  created_at: string
  updated_at: string
}

export interface TicketListItem {
  id: string
  ticket_number: string
  title: string
  department_name: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  sla_deadline: string
  assigned_to?: { id: string; name: string }
  created_at: string
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  sla_breached: number
  avg_resolution_hours: number
}

export interface CreateTicketPayload {
  title: string
  description: string
  department_id: string
  category: string
  location: string
  priority: TicketPriority
  attachments?: File[]
}
