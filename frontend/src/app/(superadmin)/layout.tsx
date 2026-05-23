'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (user?.role === 'resident') {
      router.push('/dashboard')
      return
    }
    if (user?.role === 'staff') {
      router.push('/staff/dashboard')
      return
    }
    if (user?.role === 'dept_admin') {
      router.push('/admin/dashboard')
      return
    }
  }, [_hasHydrated, mounted, isAuthenticated, user?.role, pathname, router])

  if (!_hasHydrated || !mounted) return null
  if (!isAuthenticated || user?.role !== 'super_admin') return null

  return <AppShell role="super_admin">{children}</AppShell>
}
