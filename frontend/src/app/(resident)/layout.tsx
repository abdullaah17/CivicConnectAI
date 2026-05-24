'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, _hasHydrated, setHasHydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useWebSocket()

  useEffect(() => {
    setMounted(true)
    
    // Fallback: if onRehydrateStorage already fired before this component
    // subscribed, _hasHydrated may still be false in the snapshot. Force it.
    if (!useAuthStore.getState()._hasHydrated) {
      // Zustand has already rehydrated by the time any useEffect runs —
      // just mark it done so the guard unblocks.
      setHasHydrated(true)
    }
  }, [setHasHydrated])

  useEffect(() => {
    if (!_hasHydrated || !mounted) {
      return
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Role-based redirects for wrong role access
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

  // Show loading while hydrating
  if (!_hasHydrated || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Block access if not authenticated or wrong role
  if (!isAuthenticated || user?.role !== 'resident') {
    return null
  }

  return <AppShell role="resident">{children}</AppShell>
}
