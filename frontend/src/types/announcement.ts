export type AnnouncementPriority = 'normal' | 'urgent' | 'emergency'
export type AnnouncementCategory =
  | 'general'
  | 'infrastructure'
  | 'health'
  | 'culture'
  | 'emergency'

export interface Announcement {
  id: string
  title: string
  body: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  author: {
    id: string
    name: string
    department: string
  }
  expiry_date?: string
  is_read: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  category: string
  // Normalized fields (from backend camelCase → snake_case)
  date: string          // normalized from eventDate
  time: string          // extracted from eventDate
  location: string
  capacity: number
  registered_count: number   // normalized from _count.registrations
  is_registered: boolean     // set by normalization (requires auth context)
  is_cancelled: boolean      // normalized from isCancelled
  organizer: {
    id: string
    name: string
    department: string
  }
  created_at: string
}

export interface Notification {
  id: string
  type: 'status_change' | 'sla_alert' | 'announcement' | 'event' | 'permit_update'
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}
