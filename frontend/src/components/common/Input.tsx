'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface BaseInputProps {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  containerClassName?: string
}

// Text / email / password input
interface InputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'file'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, required, containerClassName, type = 'text', className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={clsx('flex flex-col gap-1', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 font-display"
          >
            {label}
            {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              'w-full px-3 py-2 rounded-sm border text-base text-gray-900 bg-white',
              'placeholder:text-gray-400 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-gray-300 hover:border-gray-400',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Textarea
interface TextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, required, containerClassName, showCount, maxLength, className, id, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className={clsx('flex flex-col gap-1', containerClassName)}>
        {label && (
          <div className="flex justify-between items-center">
            <label htmlFor={inputId} className="text-sm font-medium text-gray-700 font-display">
              {label}
              {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
            </label>
            {showCount && maxLength && (
              <span className={clsx('text-xs', charCount > maxLength * 0.9 ? 'text-warning' : 'text-gray-400')}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          maxLength={maxLength}
          value={value}
          className={clsx(
            'w-full px-3 py-2 rounded-sm border text-base text-gray-900 bg-white resize-y min-h-[100px]',
            'placeholder:text-gray-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Select
interface SelectProps extends BaseInputProps {
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, required, containerClassName, options, value, onChange, placeholder, disabled, id, className }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`

    return (
      <div className={clsx('flex flex-col gap-1', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 font-display">
            {label}
            {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={clsx(
            'w-full px-3 py-2 rounded-sm border text-base text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-gray-300 hover:border-gray-400',
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
