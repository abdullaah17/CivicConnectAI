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
}

export const PageHeader = ({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) => (
  <div className="mb-6">
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav aria-label="Breadcrumb" className="mb-2">
        <ol className="flex items-center gap-1 text-sm text-gray-500" role="list">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />}
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link href={crumb.href} className="hover:text-primary-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
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
        <h1 className="text-2xl font-bold font-display text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  </div>
)
