'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  
  // Initialize WebSocket (it handles its own hydration checks)
  useWebSocket()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!_hasHydrated || !mounted) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'dept_admin') {
      router.push('/login')
      return
    }
  }, [_hasHydrated, mounted, isAuthenticated, user?.role, router])

  if (!_hasHydrated || !mounted) return null
  if (!isAuthenticated || user?.role !== 'dept_admin') return null

  return <AppShell role="dept_admin">{children}</AppShell>
}
