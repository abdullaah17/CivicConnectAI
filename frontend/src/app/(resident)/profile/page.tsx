'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Camera } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/store/authStore'
import { nameSchema, passwordSchema } from '@/utils/validators'
import { getErrorMessage } from '@/lib/errorHandler'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const profileSchema = z.object({ name: nameSchema })
const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
  })

  const handleProfileUpdate = async (data: { name: string }) => {
    try {
      const { data: res } = await api.patch('/users/me', data)
      updateUser({ name: res.data.name })
      toast.success('Profile updated.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update profile.'))
    }
  }

  const handlePasswordChange = async (data: { current_password: string; new_password: string }) => {
    try {
      await api.patch('/users/me/password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully.')
      passwordForm.reset()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to change password. Check your current password.'))
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)
    const formData = new FormData()
    formData.append('profile_photo', file)
    try {
      const { data } = await api.patch('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser({ profile_photo_url: data.data.profile_photo_url })
      toast.success('Profile photo updated.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to upload photo.'))
      setPhotoPreview(null)
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Profile"
        subtitle="Manage your account details."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />

      {/* Avatar */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {photoPreview || user?.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview || user?.profile_photo_url}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary-700" aria-hidden="true" />
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-900 transition-colors"
              aria-label="Change profile photo"
            >
              <Camera className="w-3 h-3" aria-hidden="true" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </div>
          <div>
            <p className="font-display font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{user?.role?.replace('_', ' ')}</Badge>
              {user?.is_verified && <Badge variant="success">Verified</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 mb-4">
        <h2 className="font-display font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} noValidate className="space-y-4">
          <Input
            label="Full Name"
            required
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <Input label="Email Address" value={user?.email || ''} disabled helperText="Email cannot be changed." />
          <Button type="submit" size="sm" loading={profileForm.formState.isSubmitting}>
            Save Changes
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
        <h2 className="font-display font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} noValidate className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />
          <Input
            label="New Password"
            type="password"
            required
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password')}
          />
          <Button type="submit" size="sm" loading={passwordForm.formState.isSubmitting}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}
