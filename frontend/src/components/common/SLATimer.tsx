'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Clock } from 'lucide-react'
import { getSLAInfo, slaUrgencyColors } from '@/utils/slaUtils'

interface SLATimerProps {
  deadline: string
  slaHours?: number
  size?: 'compact' | 'full'
  className?: string
}

export const SLATimer = ({ deadline, slaHours = 48, size = 'compact', className }: SLATimerProps) => {
  const [info, setInfo] = useState(() => getSLAInfo(deadline, slaHours))

  // Refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setInfo(getSLAInfo(deadline, slaHours))
    }, 60_000)
    return () => clearInterval(interval)
  }, [deadline, slaHours])

  const colorClass = slaUrgencyColors[info.urgency]
  const isUrgent = info.urgency === 'red'

  if (size === 'compact') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 text-xs font-medium',
          colorClass,
          isUrgent && 'sla-urgent',
          className
        )}
        aria-label={`${info.label}${isUrgent ? ' (Urgent)' : ''}`}
      >
        <Clock className="w-3 h-3" aria-hidden="true" />
        {info.label}
      </span>
    )
  }

  // Full size with progress bar
  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 font-display">SLA Deadline</span>
        <span
          className={clsx('text-sm font-semibold', colorClass, isUrgent && 'sla-urgent')}
          aria-label={`${info.label}${isUrgent ? ' (Urgent)' : ''}`}
        >
          <Clock className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
          {info.label}
        </span>
      </div>
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(info.percentRemaining)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`SLA: ${Math.round(info.percentRemaining)}% time remaining`}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            info.urgency === 'green' && 'bg-success',
            info.urgency === 'amber' && 'bg-amber-500',
            info.urgency === 'red'   && 'bg-danger'
          )}
          style={{ width: `${info.percentRemaining}%` }}
        />
      </div>
    </div>
  )
}
