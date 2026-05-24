import type { TicketListItem, TicketStats } from '@/types/ticket'
import type { PermitListItem } from '@/types/permit'
import type { User } from '@/types/user'

// Sample user data
export const sampleUser: User = {
  id: 'sample-user-1',
  name: 'Ayesha Tariq',
  email: 'ayesha@example.com',
  role: 'resident',
  profile_photo_url: undefined,
  is_active: true,
  is_verified: true,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
}

// Sample ticket data for demonstration purposes
export const sampleTickets: TicketListItem[] = [
  {
    id: 'sample-1',
    ticket_number: 'INF-2026-00001',
    title: 'Broken street light on Canal Road',
    category: 'street_lighting',
    priority: 'medium',
    status: 'In Progress',
    department_name: 'Infrastructure',
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: { id: 'staff-1', name: 'Bilal Hassan' },
  },
  {
    id: 'sample-2',
    ticket_number: 'INF-2026-00002',
    title: 'Pothole on Main Boulevard',
    category: 'road_maintenance',
    priority: 'high',
    status: 'Under Review',
    department_name: 'Infrastructure',
    sla_deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: undefined,
  },
  {
    id: 'sample-3',
    ticket_number: 'SAF-2026-00001',
    title: 'Stray dogs in park area',
    category: 'animal_control',
    priority: 'medium',
    status: 'Submitted',
    department_name: 'Public Safety',
    sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    assigned_to: undefined,
  },
  {
    id: 'sample-4',
    ticket_number: 'INF-2026-00003',
    title: 'Garbage not collected for 5 days',
    category: 'sanitation',
    priority: 'medium',
    status: 'Resolved',
    department_name: 'Infrastructure',
    sla_deadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: { id: 'staff-2', name: 'Nadia Iqbal' },
  },
  {
    id: 'sample-5',
    ticket_number: 'PER-2026-00001',
    title: 'Unauthorized construction next door',
    category: 'illegal_construction',
    priority: 'medium',
    status: 'Assigned',
    department_name: 'Permits & Licensing',
    sla_deadline: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: { id: 'staff-3', name: 'Tariq Mehmood' },
  },
]

// Sample stats data
export const sampleStats: TicketStats = {
  total: 8,
  open: 2,
  in_progress: 2,
  resolved: 3,
  sla_breached: 0,
  avg_resolution_hours: 36,
}

// Sample announcements (raw shape matching backend response)
export const sampleAnnouncements = [
  {
    id: 'ann-1',
    title: 'Scheduled Water Outage - Sector F-7',
    body: 'Water supply will be interrupted on May 15, 2026 from 8 AM to 2 PM for maintenance work. Please store water in advance.',
    category: 'infrastructure',
    priority: 'urgent',
    isEmergency: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { id: 'admin-1', fullName: 'Khalid Mahmood', department: { name: 'Infrastructure' } },
  },
  {
    id: 'ann-2',
    title: 'New Business License Renewal Process',
    body: 'Starting June 1, 2026, all business license renewals must be submitted through the CivicConnect portal. Physical submissions will no longer be accepted.',
    category: 'general',
    priority: 'normal',
    isEmergency: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: { id: 'admin-2', fullName: 'Sara Ahmed', department: { name: 'Permits & Licensing' } },
  },
  {
    id: 'ann-3',
    title: 'Emergency: Gas Leak Reported in G-9',
    body: 'A gas leak has been reported in the G-9 sector. Residents are advised to evacuate immediately and call emergency services.',
    category: 'emergency',
    priority: 'emergency',
    isEmergency: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    author: { id: 'admin-3', fullName: 'Omar Farooq', department: { name: 'Public Safety' } },
  },
]

// Sample events (raw shape matching backend response)
export const sampleEvents = [
  {
    id: 'event-1',
    title: 'Town Hall: Infrastructure Development Plan 2026',
    description: 'Join us to discuss the upcoming infrastructure projects and share your feedback.',
    category: 'infrastructure',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'City Hall, Islamabad',
    capacity: 200,
    _count: { registrations: 45 },
    is_registered: false,
    isCancelled: false,
    creator: { id: 'admin-1', fullName: 'Khalid Mahmood' },
    department: { name: 'Infrastructure' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-2',
    title: 'Community Safety Workshop',
    description: 'Learn about emergency preparedness, fire safety, and first aid basics.',
    category: 'health',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Community Center, F-7',
    capacity: 50,
    _count: { registrations: 50 },
    is_registered: true,
    isCancelled: false,
    creator: { id: 'admin-3', fullName: 'Omar Farooq' },
    department: { name: 'Public Safety' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-3',
    title: 'Annual Cultural Festival',
    description: 'Celebrate the diversity of our city with food, music, and art from all communities.',
    category: 'culture',
    eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Fatima Jinnah Park',
    capacity: 1000,
    _count: { registrations: 850 },
    is_registered: false,
    isCancelled: false,
    creator: { id: 'super-1', fullName: 'Super Administrator' },
    department: null,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Sample permits (matching PermitListItem shape exactly)
export const samplePermits: PermitListItem[] = [
  {
    id: 'permit-1',
    application_number: 'PER-2026-00001',
    permit_type: 'construction_permit',
    status: 'Draft',
    total_fee: 8000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'permit-2',
    application_number: 'PER-2026-00002',
    permit_type: 'event_permit',
    status: 'Submitted',
    total_fee: 5000,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'permit-3',
    application_number: 'PER-2026-00003',
    permit_type: 'business_license_renewal',
    status: 'Approved',
    total_fee: 3500,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Check if we should use sample data
export const shouldUseSampleData = (): boolean => {
  // Use sample data if explicitly enabled via environment variable
  if (process.env.NEXT_PUBLIC_USE_SAMPLE_DATA === 'true') {
    return true
  }
  // Use sample data if API_BASE_URL is not set or points to localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  return !apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')
}
