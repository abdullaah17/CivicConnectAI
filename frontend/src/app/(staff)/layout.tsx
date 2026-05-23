'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
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

    if (user?.role !== 'staff') {
      router.push('/login')
      return
    }
  }, [_hasHydrated, mounted, isAuthenticated, user?.role, router])

  if (!_hasHydrated || !mounted) return null
  if (!isAuthenticated || user?.role !== 'staff') return null

  return <AppShell role="staff">{children}</AppShell>
}
