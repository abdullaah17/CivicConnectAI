const { getPrisma } = require('./prismaService');

/**
 * Writes an entry to the audit_logs table.
 * Used for super_admin actions and security events.
 */
async function createAuditLog({ actorId, action, resourceType, resourceId, payload, ipAddress, userAgent }) {
  const prisma = getPrisma();
  return prisma.auditLog.create({
    data: {
      actorId: actorId || null,
      action,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      payload: payload || null,
      ipAddress: ipAddress || '0.0.0.0',
      userAgent: userAgent || null,
    },
  });
}

module.exports = { createAuditLog };
