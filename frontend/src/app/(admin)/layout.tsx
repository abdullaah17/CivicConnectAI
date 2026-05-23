'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  useWebSocket()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'dept_admin') {
      router.push('/login')
    }
  }, [_hasHydrated, isAuthenticated, user, router])

  if (!_hasHydrated) return null
  if (!isAuthenticated || user?.role !== 'dept_admin') return null

  return <AppShell role="dept_admin">{children}</AppShell>
}
