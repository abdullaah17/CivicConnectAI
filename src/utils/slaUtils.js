/**
 * Calculates the SLA deadline based on department config and ticket priority.
 * @param {Object} slaConfig - e.g. { low: 72, medium: 48, high: 24, emergency: 4 }
 * @param {string} priority  - 'low' | 'medium' | 'high' | 'emergency'
 * @param {Date}   createdAt - ticket creation timestamp
 * @returns {Date} SLA deadline
 */
function calculateSlaDeadline(slaConfig, priority, createdAt) {
  const hours = slaConfig[priority];
  if (!hours) throw new Error(`Invalid priority: ${priority}`);
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

/**
 * Returns the SLA health status for a given deadline.
 * @param {Date|string} deadline
 * @returns {'healthy'|'warning'|'critical'|'breached'}
 */
function getSlaStatus(deadline) {
  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const remaining = deadlineMs - now;

  if (remaining < 0) return 'breached';
  if (remaining < 2 * 60 * 60 * 1000) return 'critical';   // < 2 hours
  if (remaining < 8 * 60 * 60 * 1000) return 'warning';    // < 8 hours
  return 'healthy';
}

module.exports = { calculateSlaDeadline, getSlaStatus };
