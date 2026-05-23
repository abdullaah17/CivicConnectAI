import type { User } from '@/types/user'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeUser(raw: any): User {
  return {
    ...raw,
    name: raw.name ?? raw.full_name ?? raw.fullName ?? '',
    profile_photo_url: raw.profile_photo_url ?? raw.profilePhotoUrl,
    department_id: raw.department_id ?? raw.departmentId,
    is_active: raw.is_active ?? raw.isActive ?? true,
    is_verified: raw.is_verified ?? raw.isVerified ?? raw.otp_verified ?? raw.otpVerified ?? false,
    created_at: raw.created_at ?? raw.createdAt ?? '',
  }
}
