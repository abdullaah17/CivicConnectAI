'use client'

import { clsx } from 'clsx'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  ctaLabel?: string
  ctaAction?: () => void
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  ctaLabel,
  ctaAction,
  className,
}: EmptyStateProps) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}
  >
    {icon && (
      <div className="mb-4 text-gray-300" aria-hidden="true">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-700 font-display mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
    )}
    {ctaLabel && ctaAction && (
      <Button onClick={ctaAction} size="md">
        {ctaLabel}
      </Button>
    )}
  </div>
)
