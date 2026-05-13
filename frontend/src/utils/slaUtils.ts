import { parseISO, differenceInMilliseconds, differenceInHours, differenceInMinutes } from 'date-fns'

export type SLAUrgency = 'green' | 'amber' | 'red'

export interface SLAInfo {
  urgency: SLAUrgency
  label: string
  hoursRemaining: number
  minutesRemaining: number
  isBreached: boolean
  percentRemaining: number
}

/**
 * Calculate SLA urgency and display info from a deadline ISO string.
 * slaHours is the total SLA window (e.g. 48 for Medium priority).
 */
export const getSLAInfo = (deadline: string, slaHours = 48): SLAInfo => {
  const now = new Date()
  const deadlineDate = parseISO(deadline)
  const msRemaining = differenceInMilliseconds(deadlineDate, now)
  const isBreached = msRemaining <= 0

  const hoursRemaining = Math.max(0, differenceInHours(deadlineDate, now))
  const minutesRemaining = Math.max(0, differenceInMinutes(deadlineDate, now) % 60)

  const totalMs = slaHours * 60 * 60 * 1000
  const percentRemaining = isBreached ? 0 : Math.min(100, (msRemaining / totalMs) * 100)

  let urgency: SLAUrgency = 'green'
  if (isBreached || percentRemaining < 20 || hoursRemaining < 2) {
    urgency = 'red'
  } else if (percentRemaining < 50) {
    urgency = 'amber'
  }

  let label: string
  if (isBreached) {
    label = 'SLA Breached'
  } else if (hoursRemaining === 0) {
    label = `${minutesRemaining}m remaining`
  } else {
    label = `${hoursRemaining}h ${minutesRemaining}m remaining`
  }

  return { urgency, label, hoursRemaining, minutesRemaining, isBreached, percentRemaining }
}

export const slaUrgencyColors: Record<SLAUrgency, string> = {
  green: 'text-success',
  amber: 'text-amber-500',
  red:   'text-danger',
}

export const slaUrgencyBg: Record<SLAUrgency, string> = {
  green: 'bg-success-bg',
  amber: 'bg-amber-100',
  red:   'bg-danger-bg',
}
