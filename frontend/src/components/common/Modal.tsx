'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** If true, Escape key will NOT close the modal */
  preventEscapeClose?: boolean
  className?: string
}

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-full mx-4 md:mx-auto md:max-w-4xl',
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  preventEscapeClose = false,
  className,
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventEscapeClose) {
        onClose()
      }
      // Focus trap
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault()
          ;(e.shiftKey ? last : first)?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    firstFocusableRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose, preventEscapeClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      ref={overlayRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={preventEscapeClose ? undefined : onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={clsx(
          'relative w-full bg-white rounded-lg shadow-modal z-10',
          'max-h-[90vh] overflow-y-auto',
          // Full screen on mobile
          'md:rounded-lg rounded-none md:max-h-[90vh] max-h-screen',
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold font-display text-gray-900">
              {title}
            </h2>
            {!preventEscapeClose && (
              <button
                ref={firstFocusableRef}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
