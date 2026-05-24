'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  /** 'light' = dark text for white-bg shells (default). 'dark' = white text for image backgrounds. */
  variant?: 'light' | 'dark'
}

export const PageHeader = ({ title, subtitle, breadcrumbs, actions, variant = 'light' }: PageHeaderProps) => {
  const isDark = variant === 'dark'
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className={`flex items-center gap-1 text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`} role="list">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} aria-hidden="true" />}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-primary-700'}`}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={i === breadcrumbs.length - 1 ? `font-medium ${isDark ? 'text-white' : 'text-gray-900'}` : ''}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {subtitle && <p className={`mt-1 text-sm ${isDark ? 'text-white/70' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
