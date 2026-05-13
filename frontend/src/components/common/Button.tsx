'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-900 focus-visible:ring-primary-700 disabled:bg-primary-100 disabled:text-primary-500',
  secondary:
    'bg-primary-100 text-primary-700 hover:bg-primary-500 hover:text-white focus-visible:ring-primary-500',
  outline:
    'border border-primary-700 text-primary-700 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-700',
  ghost:
    'text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
  danger:
    'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger disabled:bg-danger-bg disabled:text-danger',
  success:
    'bg-success text-white hover:bg-green-700 focus-visible:ring-success',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-display font-medium rounded transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
