'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/common/Badge'
import api from '@/lib/api'

interface Department {
  id: string
  name: string
  code: string
  head_name?: string
  total_tickets: number
  open_tickets: number
  sla_breach_rate: number
}

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments')
      return data.data as Department[]
    },
  })

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="System-wide department overview and configuration."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Departments' }]}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : !departments?.length ? (
        <EmptyState icon={<Building2 className="w-12 h-12" />} title="No departments configured" description="Contact system administrator." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <span className="font-mono-civic text-xs text-gray-400">{dept.code}</span>
                </div>
                <Badge variant={dept.sla_breach_rate > 25 ? 'danger' : dept.sla_breach_rate > 10 ? 'warning' : 'success'}>
                  {dept.sla_breach_rate}% breach
                </Badge>
              </div>
              {dept.head_name && (
                <p className="text-sm text-gray-600 mb-3">Head: <span className="font-medium">{dept.head_name}</span></p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-xl font-bold text-gray-900">{dept.total_tickets}</p>
                  <p className="text-xs text-gray-500">Total Tickets</p>
                </div>
                <div className="bg-amber-50 rounded p-2 text-center">
                  <p className="text-xl font-bold text-amber-700">{dept.open_tickets}</p>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
