'use client'

import { useEffect } from 'react'
import { clsx } from 'clsx'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNavBar } from './BottomNavBar'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { EmergencyBanner } from '@/components/announcements/EmergencyBanner'
import type { UserRole } from '@/types/user'

interface AppShellProps {
  children: React.ReactNode
  role?: UserRole
}

export const AppShell = ({ children, role }: AppShellProps) => {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, emergencyBanner, theme } = useUIStore()
  const effectiveRole = role || user?.role || 'resident'
  const isDark = theme === 'dark'

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [setSidebarOpen])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
      {/* Skip navigation */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Emergency Banner */}
      {emergencyBanner.visible && emergencyBanner.announcement && (
        <EmergencyBanner announcement={emergencyBanner.announcement} />
      )}

      {/*
        Dark mode solid surface — sits above the video (-z-10) but below UI (z-0).
        Gives dashboard pages a proper dark background instead of the video showing through.
      */}
      {isDark && (
        <div
          className="fixed inset-0 -z-[5] transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
          aria-hidden="true"
        />
      )}

      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
          aria-label="Sidebar navigation"
        >
          <Sidebar role={effectiveRole as UserRole} />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="fixed left-0 top-0 bottom-0 z-40 w-72 shadow-xl lg:hidden flex flex-col pt-16 overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <Sidebar role={effectiveRole as UserRole} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main
          id="main-content"
          className={clsx(
            'flex-1 overflow-y-auto',
            'p-4 md:p-6 lg:p-8',
            'pb-24 lg:pb-8',
            'min-w-0'
          )}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavBar role={effectiveRole as UserRole} />
    </div>
  )
}
