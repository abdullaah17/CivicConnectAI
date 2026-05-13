'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/common/Button'
import { formatDateTime } from '@/utils/formatDate'
import api from '@/lib/api'

interface AuditLog {
  id: string
  actor: { id: string; name: string; email: string }
  action: string
  resource_type: string
  resource_id: string
  ip_address: string
  created_at: string
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get('/audit-logs', { params: { page, limit: 20 } })
      return data.data as { logs: AuditLog[]; total: number }
    },
  })

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="All super admin actions with IP address and timestamp."
        breadcrumbs={[{ label: 'Overview', href: '/superadmin/dashboard' }, { label: 'Audit Logs' }]}
      />

      {isLoading ? (
        <SkeletonList count={5} />
      ) : !data?.logs?.length ? (
        <EmptyState icon={<ShieldCheck className="w-12 h-12" />} title="No audit logs" description="No actions have been recorded yet." />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Resource</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP Address</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{log.actor.name}</p>
                        <p className="text-xs text-gray-400">{log.actor.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono-civic text-xs text-gray-700 bg-gray-50 rounded">{log.action}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="capitalize">{log.resource_type}</span>
                        <span className="text-gray-400 ml-1 font-mono-civic text-xs">#{log.resource_id.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 font-mono-civic text-xs text-gray-500">{log.ip_address}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.total > 20 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(data.total / 20)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / 20)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
