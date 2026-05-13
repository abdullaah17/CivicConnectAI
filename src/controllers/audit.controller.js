const { getPrisma } = require('../services/prismaService');

// GET /audit
async function listAuditLogs(req, res) {
  const { actor_id, action, page = 1, limit = 20, start_date, end_date } = req.query;
  const prisma = getPrisma();
  const where = {};
  if (actor_id) where.actorId = actor_id;
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt.gte = new Date(start_date);
    if (end_date) where.createdAt.lte = new Date(end_date);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take: Number(limit), include: { actor: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.count({ where }),
  ]);
  return res.status(200).json({ success: true, data: logs, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

module.exports = { listAuditLogs };
