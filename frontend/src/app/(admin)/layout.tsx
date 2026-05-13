'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  useWebSocket()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'dept_admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'dept_admin') return null

  return <AppShell role="dept_admin">{children}</AppShell>
}
