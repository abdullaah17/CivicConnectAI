import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
} from 'date-fns'

export const formatDate = (dateStr: string | null | undefined, pattern = 'dd MMM yyyy'): string => {
  if (!dateStr) return '—'
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  return format(date, pattern)
}

export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  return format(date, 'dd MMM yyyy, hh:mm a')
}

export const timeAgo = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

export const formatCurrency = (amount: number | null | undefined, currency = 'PKR'): string => {
  if (amount == null) return '—'
  return `${currency} ${amount.toLocaleString('en-PK')}`
}
