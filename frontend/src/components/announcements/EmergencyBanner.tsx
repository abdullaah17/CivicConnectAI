'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useUIStore } from '@/store/uiStore'
import api from '@/lib/api'
import type { Announcement } from '@/types/announcement'

interface EmergencyBannerProps {
  announcement: Announcement
}

export const EmergencyBanner = ({ announcement }: EmergencyBannerProps) => {
  const { dismissEmergencyBanner } = useUIStore()

  // Prevent Escape from closing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [])

  const handleDismiss = async () => {
    try {
      await api.patch(`/announcements/${announcement.id}/read`)
    } catch {
      // ignore
    }
    dismissEmergencyBanner()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      aria-describedby="emergency-body"
    >
      <div className="bg-white rounded-lg shadow-modal max-w-lg w-full mx-4 overflow-hidden emergency-pulse">
        {/* Red header */}
        <div className="bg-danger px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" aria-hidden="true" />
          <h2 id="emergency-title" className="text-white font-display font-bold text-lg">
            ⚠️ Emergency Alert
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <h3 className="font-display font-semibold text-gray-900 text-base mb-2">
            {announcement.title}
          </h3>
          <p id="emergency-body" className="text-gray-700 text-sm leading-relaxed">
            {announcement.body}
          </p>
        </div>

        {/* Action */}
        <div className="px-6 pb-5">
          <Button
            onClick={handleDismiss}
            variant="danger"
            size="md"
            className="w-full"
          >
            I Understand — Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
