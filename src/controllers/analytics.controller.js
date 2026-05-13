const { getPrisma } = require('../services/prismaService');
const { exportCsv } = require('../services/csvExportService');
const { generatePdfReport } = require('../services/pdfReportService');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 }); // 60-second cache for analytics

function getCacheKey(prefix, query) {
  return `${prefix}:${JSON.stringify(query)}`;
}

// GET /analytics/tickets  (also aliased as /analytics/tickets/summary)
async function ticketSummary(req, res) {
  const { department_id, start_date, end_date } = req.query;
  const prisma = getPrisma();
  const { role, department_id: userDeptId } = req.user;

  const deptId = role === 'super_admin' ? department_id : userDeptId;
  const cacheKey = getCacheKey('tickets', { deptId, start_date, end_date });
  const cached = cache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, data: cached });

  const where = {};
  if (deptId) where.departmentId = deptId;
  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt.gte = new Date(start_date);
    if (end_date) where.createdAt.lte = new Date(end_date);
  }

  const [byStatus, total, department] = await Promise.all([
    prisma.ticket.groupBy({ by: ['status'], where, _count: { status: true } }),
    prisma.ticket.count({ where }),
    deptId ? prisma.department.findUnique({ where: { id: deptId }, select: { name: true } }) : null,
  ]);

  // SLA breach rate
  const breached = await prisma.ticket.count({ where: { ...where, slaDeadline: { lt: new Date() }, status: { notIn: ['resolved', 'closed'] } } });
  const slaBreachRate = total > 0 ? Number((breached / total).toFixed(3)) : 0;

  const statusMap = {};
  byStatus.forEach((r) => { statusMap[r.status] = r._count.status; });

  const data = {
    period: { start: start_date || null, end: end_date || null },
    department: department?.name || 'All Departments',
    by_status: statusMap,
    total,
    sla_breach_rate: slaBreachRate,
  };

  cache.set(cacheKey, data);
  return res.status(200).json({ success: true, data });
}

// GET /analytics/permits
async function permitSummary(req, res) {
  const prisma = getPrisma();
  const byStatus = await prisma.permitApplication.groupBy({ by: ['status'], _count: { status: true } });
  const statusMap = {};
  byStatus.forEach((r) => { statusMap[r.status] = r._count.status; });
  return res.status(200).json({ success: true, data: { by_status: statusMap } });
}

// GET /analytics/sla
async function slaSummary(req, res) {
  const { department_id, start_date, end_date } = req.query;
  const prisma = getPrisma();
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? department_id : userDeptId;

  const where = {};
  if (deptId) where.departmentId = deptId;
  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt.gte = new Date(start_date);
    if (end_date) where.createdAt.lte = new Date(end_date);
  }

  const [total, breached] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { ...where, slaDeadline: { lt: new Date() } } }),
  ]);

  return res.status(200).json({ success: true, data: { total_tickets: total, breached_tickets: breached, breach_rate: total > 0 ? Number((breached / total).toFixed(3)) : 0 } });
}

// GET /analytics/top-issues
async function topIssues(req, res) {
  const prisma = getPrisma();
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? req.query.department_id : userDeptId;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const where = { createdAt: { gte: thirtyDaysAgo } };
  if (deptId) where.departmentId = deptId;

  const grouped = await prisma.ticket.groupBy({ by: ['category'], where, _count: { category: true }, orderBy: { _count: { category: 'desc' } }, take: 5 });
  return res.status(200).json({ success: true, data: grouped.map((r) => ({ category: r.category, count: r._count.category })) });
}

// GET /analytics/heatmap
async function heatmap(req, res) {
  const prisma = getPrisma();
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? req.query.department_id : userDeptId;

  const where = { location: { not: null } };
  if (deptId) where.departmentId = deptId;

  const grouped = await prisma.ticket.groupBy({ by: ['location'], where, _count: { location: true }, orderBy: { _count: { location: 'desc' } }, take: 20 });
  return res.status(200).json({ success: true, data: grouped.map((r) => ({ location: r.location, count: r._count.location })) });
}

// GET /analytics/export-csv
async function exportCsvHandler(req, res) {
  const { dataset = 'tickets', department_id, start_date, end_date } = req.query;
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? department_id : userDeptId;
  await exportCsv(res, { dataset, departmentId: deptId, startDate: start_date, endDate: end_date, role });
}

// GET /analytics/export-pdf
async function exportPdfHandler(req, res) {
  const { department_id, start_date, end_date } = req.query;
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? department_id : userDeptId;
  await generatePdfReport(res, { departmentId: deptId, startDate: start_date, endDate: end_date });
}

module.exports = { ticketSummary, permitSummary, slaSummary, topIssues, heatmap, exportCsvHandler, exportPdfHandler };
