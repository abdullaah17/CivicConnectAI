'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  AlertCircle,
  Ticket,
  FileText,
  Megaphone,
  Calendar,
  Users,
  BarChart2,
  Settings,
  Radio,
  ClipboardList,
  Building2,
  ShieldCheck,
  ScrollText,
} from 'lucide-react'
import type { UserRole } from '@/types/user'
import { useUIStore } from '@/store/uiStore'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const residentNav: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',       icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Report Issue', href: '/requests/new',    icon: <AlertCircle className="w-5 h-5" /> },
  { label: 'My Tickets',   href: '/requests',        icon: <Ticket className="w-5 h-5" /> },
  { label: 'Permits',      href: '/permits',         icon: <FileText className="w-5 h-5" /> },
  { label: 'Announcements',href: '/announcements',   icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Events',       href: '/events',          icon: <Calendar className="w-5 h-5" /> },
]

const staffNav: NavItem[] = [
  { label: 'Dashboard',  href: '/staff/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Queue',   href: '/staff/tickets',   icon: <ClipboardList className="w-5 h-5" /> },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard',     href: '/admin/dashboard',    icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tickets',       href: '/admin/tickets',      icon: <Ticket className="w-5 h-5" /> },
  { label: 'Permits',       href: '/admin/permits',      icon: <FileText className="w-5 h-5" /> },
  { label: 'Staff',         href: '/admin/staff',        icon: <Users className="w-5 h-5" /> },
  { label: 'Analytics',     href: '/admin/analytics',    icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Announcements', href: '/admin/announcements',icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Events',        href: '/admin/events',       icon: <Calendar className="w-5 h-5" /> },
  { label: 'SLA Config',    href: '/admin/sla-config',   icon: <Settings className="w-5 h-5" /> },
]

const superAdminNav: NavItem[] = [
  { label: 'Overview',    href: '/superadmin/dashboard',   icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Departments', href: '/superadmin/departments', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Users',       href: '/superadmin/users',       icon: <Users className="w-5 h-5" /> },
  { label: 'Analytics',   href: '/superadmin/analytics',   icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Reports',     href: '/superadmin/reports',     icon: <ScrollText className="w-5 h-5" /> },
  { label: 'Broadcast',   href: '/superadmin/broadcast',   icon: <Radio className="w-5 h-5" /> },
  { label: 'Audit Logs',  href: '/superadmin/audit',       icon: <ShieldCheck className="w-5 h-5" /> },
]

const navByRole: Record<UserRole, NavItem[]> = {
  resident:    residentNav,
  staff:       staffNav,
  dept_admin:  adminNav,
  super_admin: superAdminNav,
}

interface SidebarProps {
  role: UserRole
}

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname()
  const { setSidebarOpen } = useUIStore()
  const navItems = navByRole[role] || []

  return (
    <nav aria-label="Main navigation" className="flex flex-col h-full py-4">
      <ul className="flex-1 space-y-1 px-3" role="list">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + '/') &&
              item.href !== '/' &&
              !navItems.some(
                (other) =>
                  other.href !== item.href &&
                  pathname.startsWith(other.href + '/') &&
                  other.href.length > item.href.length
              ))
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors duration-150',
                  'min-h-[44px]',
                  isActive
                    ? 'bg-black text-[#E1E0CC]'
                    : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
