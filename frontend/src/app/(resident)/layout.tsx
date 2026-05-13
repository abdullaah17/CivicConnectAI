'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  useWebSocket()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    // Redirect non-residents to their correct dashboard
    if (user?.role === 'staff') router.push('/staff/dashboard')
    else if (user?.role === 'dept_admin') router.push('/admin/dashboard')
    else if (user?.role === 'super_admin') router.push('/superadmin/dashboard')
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'resident') return null

  return <AppShell role="resident">{children}</AppShell>
}
