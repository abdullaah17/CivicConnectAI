import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
} from 'date-fns'

export const formatDate = (dateStr: string, pattern = 'dd MMM yyyy'): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return 'Invalid date'
  return format(date, pattern)
}

export const formatDateTime = (dateStr: string): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return 'Invalid date'
  return format(date, 'dd MMM yyyy, hh:mm a')
}

export const timeAgo = (dateStr: string): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return formatDistanceToNow(date, { addSuffix: true })
}

export const formatCurrency = (amount: number, currency = 'PKR'): string => {
  return `${currency} ${amount.toLocaleString('en-PK')}`
}
