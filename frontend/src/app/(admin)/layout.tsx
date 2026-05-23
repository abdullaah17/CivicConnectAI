'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, _hasHydrated, setHasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useWebSocket()

  useEffect(() => {
    setMounted(true)
    if (!useAuthStore.getState()._hasHydrated) {
      setHasHydrated(true)
    }
  }, [setHasHydrated])

  useEffect(() => {
    if (!_hasHydrated || !mounted) return

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (user?.role === 'resident') { router.push('/dashboard'); return }
    if (user?.role === 'staff') { router.push('/staff/dashboard'); return }
    if (user?.role === 'super_admin') { router.push('/superadmin/dashboard'); return }
  }, [_hasHydrated, mounted, isAuthenticated, user?.role, pathname, router])

  if (!_hasHydrated || !mounted) return null
  if (!isAuthenticated || user?.role !== 'dept_admin') return null

  return <AppShell role="dept_admin">{children}</AppShell>
}
