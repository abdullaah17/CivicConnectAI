'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, UserPlus, UserX, UserCheck, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { emailSchema, nameSchema, passwordSchema } from '@/utils/validators'
import { getErrorMessage } from '@/lib/errorHandler'
import { normalizeUser } from '@/lib/normalizers'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { User } from '@/types/user'

const createStaffSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})
type CreateStaffData = z.infer<typeof createStaffSchema>

export default function StaffManagementPage() {
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [search, setSearch] = useState('')

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { role: 'staff' } })
      return (data.data as User[]).map(normalizeUser)
    },
  })

  const filtered = staff?.filter((m) =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const createStaff = useMutation({
    mutationFn: async (payload: CreateStaffData) => {
      const { data } = await api.post('/users/staff', payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff account created.')
      setAddModal(false)
      form.reset()
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to create staff account.')),
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await api.patch(`/users/${id}/status`, { is_active })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff status updated.')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update status.')),
  })

  const form = useForm<CreateStaffData>({ resolver: zodResolver(createStaffSchema) })

  return (
    <div>
      <PageHeader
        title="Staff Management"
        subtitle="Manage department staff accounts and workloads."
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Staff' }]}
        actions={
          <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
            Add Staff
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-sm border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            aria-label="Search staff"
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !filtered?.length ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title={search ? 'No staff found' : 'No staff members'}
          description={search ? 'Try a different search term.' : 'Add staff members to your department.'}
          ctaLabel={!search ? 'Add Staff' : undefined}
          ctaAction={!search ? () => setAddModal(true) : undefined}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={member.is_active ? 'success' : 'default'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate({ id: member.id, is_active: !member.is_active })}
                      leftIcon={member.is_active
                        ? <UserX className="w-3.5 h-3.5" />
                        : <UserCheck className="w-3.5 h-3.5" />
                      }
                    >
                      {member.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add staff modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Staff Member" size="sm">
        <form onSubmit={form.handleSubmit((d) => createStaff.mutate(d))} noValidate className="space-y-4">
          <Input label="Full Name" required error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Email Address" type="email" required error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input label="Temporary Password" type="password" required error={form.formState.errors.password?.message} {...form.register('password')} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button size="sm" type="submit" loading={createStaff.isPending}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
