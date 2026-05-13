import { clsx } from 'clsx'
import { CheckCircle2, Circle } from 'lucide-react'
import { StatusBadge } from '@/components/common/Badge'
import { formatDateTime } from '@/utils/formatDate'
import type { StatusHistoryEntry } from '@/types/ticket'

interface StatusTimelineProps {
  history: StatusHistoryEntry[]
}

export const StatusTimeline = ({ history }: StatusTimelineProps) => {
  if (!history.length) return null

  return (
    <div className="space-y-0" aria-label="Ticket status history">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1
        return (
          <div
            key={entry.id}
            className="flex gap-3"
            aria-label={`Status changed to ${entry.to_status} by ${entry.actor.name} on ${formatDateTime(entry.created_at)}`}
          >
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                  isLast
                    ? 'bg-primary-700 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                )}
                aria-hidden="true"
              >
                {isLast ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 my-1" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className={clsx('pb-4 flex-1', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <StatusBadge status={entry.to_status} />
                <span className="text-xs text-gray-500">
                  by <span className="font-medium text-gray-700">{entry.actor.name}</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDateTime(entry.created_at)}</p>
              {entry.public_note && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-100">
                  {entry.public_note}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
