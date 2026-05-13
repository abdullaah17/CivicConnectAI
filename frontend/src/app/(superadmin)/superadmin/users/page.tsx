'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserX, UserCheck, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { User } from '@/types/user'

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'resident', label: 'Resident' },
  { value: 'staff', label: 'Staff' },
  { value: 'dept_admin', label: 'Dept Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const roleVariant = {
  resident:    'default',
  staff:       'primary',
  dept_admin:  'warning',
  super_admin: 'danger',
} as const

export default function UserManagementPage() {
  const qc = useQueryClient()
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'all', { role }],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { role: role || undefined } })
      return data.data as User[]
    },
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await api.patch(`/users/${id}/status`, { is_active })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated.')
    },
    onError: () => toast.error('Failed to update user status.'),
  })

  const filtered = users?.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View and manage all users across the system."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Users' }]}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-sm border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            aria-label="Search users"
          />
        </div>
        <Select options={ROLE_OPTIONS} value={role} onChange={setRole} containerClassName="w-40" />
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : !filtered?.length ? (
        <EmptyState icon={<Users className="w-12 h-12" />} title="No users found" description="No users match your search." />
      ) : (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleVariant[user.role] || 'default'}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_active ? 'success' : 'default'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'super_admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus.mutate({ id: user.id, is_active: !user.is_active })}
                          leftIcon={user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
