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
  /** 'light' = dark text for white-bg shells (default). 'dark' = white text for image backgrounds. */
  variant?: 'light' | 'dark'
}

export const EmptyState = ({
  icon,
  title,
  description,
  ctaLabel,
  ctaAction,
  className,
  variant = 'light',
}: EmptyStateProps) => {
  const isDark = variant === 'dark'
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className={`mb-4 ${isDark ? 'text-white/40' : 'text-gray-300'}`} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={`text-lg font-semibold font-display mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>{title}</h3>
      {description && (
        <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{description}</p>
      )}
      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction} size="md">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
