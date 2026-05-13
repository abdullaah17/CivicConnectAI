export type AnnouncementPriority = 'normal' | 'urgent' | 'emergency'
export type AnnouncementCategory =
  | 'General'
  | 'Infrastructure'
  | 'Health'
  | 'Safety'
  | 'Events'
  | 'Permits'

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
  date: string
  time: string
  location: string
  capacity: number
  registered_count: number
  is_registered: boolean
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
