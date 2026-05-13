'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useUIStore } from '@/store/uiStore'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useState, useRef, useEffect } from 'react'
import api from '@/lib/api'

export const Navbar = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { toggleSidebar } = useUIStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      logout()
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 glass border-b border-white/20 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-[#E1E0CC] text-xs font-bold font-display">CC</span>
            </div>
            <span className="hidden sm:block font-display font-bold text-gray-900 text-lg">
              CivicConnect
            </span>
          </Link>
        </div>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={clsx(
                'relative p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors',
                'min-h-[44px] min-w-[44px] flex items-center justify-center'
              )}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notifOpen}
              aria-haspopup="true"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors min-h-[44px]"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center overflow-hidden">
                {user?.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile_photo_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#E1E0CC]" aria-hidden="true" />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" aria-hidden="true" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Profile
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger-bg w-full text-left"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
