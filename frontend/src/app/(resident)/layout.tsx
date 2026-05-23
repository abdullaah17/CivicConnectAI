'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  
  // Initialize WebSocket (it handles its own hydration checks)
  useWebSocket()

  // Wait for both Zustand hydration AND component mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Don't run any auth checks until both hydration and mount are complete
    if (!_hasHydrated || !mounted) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Redirect non-residents to their correct dashboard
    if (user?.role === 'staff') {
      router.push('/staff/dashboard')
      return
    }
    if (user?.role === 'dept_admin') {
      router.push('/admin/dashboard')
      return
    }
    if (user?.role === 'super_admin') {
      router.push('/superadmin/dashboard')
      return
    }
  }, [_hasHydrated, mounted, isAuthenticated, user?.role, pathname, router])

  // Don't render anything until hydration is complete
  if (!_hasHydrated || !mounted) return null

  // If authenticated and is resident, render the layout
  if (isAuthenticated && user?.role === 'resident') {
    return <AppShell role="resident">{children}</AppShell>
  }

  // Otherwise, return null (redirect will happen in useEffect)
  return null
}
