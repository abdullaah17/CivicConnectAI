export type UserRole = 'resident' | 'staff' | 'dept_admin' | 'super_admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department_id?: string
  profile_photo_url?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface AuthUser extends User {
  accessToken: string
}
