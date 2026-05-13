/**
 * Format a ticket number for display.
 * e.g. "INF-2026-00047"
 */
export const formatTicketId = (ticketNumber: string): string => ticketNumber

/**
 * Get department prefix from ticket number.
 */
export const getDeptPrefix = (ticketNumber: string): string => {
  return ticketNumber.split('-')[0] || ''
}
