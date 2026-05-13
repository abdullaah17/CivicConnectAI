'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  AlertCircle,
  Ticket,
  FileText,
  Megaphone,
  Calendar,
  ClipboardList,
  BarChart2,
  Users,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/user'

const MOBILE_LABEL_WIDTH = 72

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const residentNav: NavItem[] = [
  { label: 'Home',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Report',   href: '/requests/new',  icon: AlertCircle },
  { label: 'Tickets',  href: '/requests',      icon: Ticket },
  { label: 'Permits',  href: '/permits',       icon: FileText },
  { label: 'Updates',  href: '/announcements', icon: Megaphone },
  { label: 'Events',   href: '/events',        icon: Calendar },
]

const staffNav: NavItem[] = [
  { label: 'Home',  href: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Queue', href: '/staff/tickets',   icon: ClipboardList },
]

const adminNav: NavItem[] = [
  { label: 'Home',      href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Tickets',   href: '/admin/tickets',      icon: Ticket },
  { label: 'Staff',     href: '/admin/staff',        icon: Users },
  { label: 'Analytics', href: '/admin/analytics',    icon: BarChart2 },
  { label: 'Announce',  href: '/admin/announcements',icon: Megaphone },
]

const superAdminNav: NavItem[] = [
  { label: 'Home',      href: '/superadmin/dashboard', icon: LayoutDashboard },
  { label: 'Users',     href: '/superadmin/users',     icon: Users },
  { label: 'Analytics', href: '/superadmin/analytics', icon: BarChart2 },
  { label: 'Broadcast', href: '/superadmin/broadcast', icon: Radio },
]

const navByRole: Record<UserRole, NavItem[]> = {
  resident:    residentNav,
  staff:       staffNav,
  dept_admin:  adminNav,
  super_admin: superAdminNav,
}

interface BottomNavBarProps {
  role: UserRole
  className?: string
}

export function BottomNavBar({ role, className }: BottomNavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = navByRole[role] ?? residentNav

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Bottom Navigation"
      className={cn(
        // Base pill shape
        'bg-white border border-gray-200 rounded-full flex items-center p-2 shadow-xl space-x-1 h-[56px]',
        // Fixed to bottom center on mobile only
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden',
        // Prevent overflow on small screens
        'max-w-[95vw]',
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <motion.button
            key={item.href}
            whileTap={{ scale: 0.93 }}
            className={cn(
              'flex items-center px-3 py-2 rounded-full transition-colors duration-200 relative h-10 min-w-[44px] min-h-[40px] max-h-[44px]',
              isActive
                ? 'bg-primary-700/10 text-primary-700 gap-2'
                : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-1'
            )}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            type="button"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.8}
              aria-hidden
              className="transition-all duration-200 flex-shrink-0"
            />

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : '0px',
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? '6px' : '0px',
              }}
              transition={{
                width:       { type: 'spring', stiffness: 350, damping: 32 },
                opacity:     { duration: 0.18 },
                marginLeft:  { duration: 0.18 },
              }}
              className="overflow-hidden flex items-center"
            >
              <span
                className={cn(
                  'font-semibold text-xs whitespace-nowrap select-none text-primary-700',
                  'text-[clamp(0.625rem,0.5263rem+0.5263vw,0.8rem)] leading-none'
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.button>
        )
      })}
    </motion.nav>
  )
}

export default BottomNavBar
