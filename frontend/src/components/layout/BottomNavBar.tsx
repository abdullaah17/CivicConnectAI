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
import { isNavActive } from '@/lib/navUtils'
import type { UserRole } from '@/types/user'

const MOBILE_LABEL_WIDTH = 72

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const residentNav: NavItem[] = [
  { label: 'Home',    href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Report',  href: '/requests/new',  icon: AlertCircle },
  { label: 'Tickets', href: '/requests',      icon: Ticket },
  { label: 'Permits', href: '/permits',       icon: FileText },
  { label: 'Updates', href: '/announcements', icon: Megaphone },
  { label: 'Events',  href: '/events',        icon: Calendar },
]

const staffNav: NavItem[] = [
  { label: 'Home',  href: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Queue', href: '/staff/tickets',   icon: ClipboardList },
]

const adminNav: NavItem[] = [
  { label: 'Home',     href: '/admin/dashboard',     icon: LayoutDashboard },
  { label: 'Tickets',  href: '/admin/tickets',       icon: Ticket },
  { label: 'Staff',    href: '/admin/staff',         icon: Users },
  { label: 'Analytics',href: '/admin/analytics',     icon: BarChart2 },
  { label: 'Announce', href: '/admin/announcements', icon: Megaphone },
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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Bottom Navigation"
      className={cn(
        // Pill shape — glass surface matching app aesthetic
        'glass border border-white/30 rounded-full',
        'flex items-center p-2 shadow-xl space-x-1',
        'h-[52px] min-w-[320px] max-w-[95vw]',
        // Fixed bottom-center, mobile only
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden',
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = isNavActive(item.href, pathname, navItems)

        return (
          <motion.button
            key={item.href}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200',
              'relative h-10 min-w-[44px] min-h-[40px] max-h-[44px]',
              isActive
                ? 'bg-primary-700/10 text-primary-700 gap-2'
                : 'bg-transparent text-gray-500 hover:bg-white/40 hover:text-gray-700',
              'focus:outline-none focus-visible:ring-0'
            )}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            type="button"
          >
            <Icon
              size={22}
              strokeWidth={2}
              aria-hidden
              className="transition-colors duration-200 flex-shrink-0"
            />

            {/* Animated label — expands when active */}
            <motion.div
              initial={false}
              animate={{
                width:      isActive ? `${MOBILE_LABEL_WIDTH}px` : '0px',
                opacity:    isActive ? 1 : 0,
                marginLeft: isActive ? '8px' : '0px',
              }}
              transition={{
                width:      { type: 'spring', stiffness: 350, damping: 32 },
                opacity:    { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="overflow-hidden flex items-center max-w-[72px]"
            >
              <span
                className={cn(
                  'font-medium whitespace-nowrap select-none overflow-hidden text-ellipsis leading-[1.9]',
                  'text-[clamp(0.625rem,0.5263rem+0.5263vw,1rem)]',
                  isActive ? 'text-primary-700' : 'opacity-0'
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
