const { getPrisma } = require('../services/prismaService');
const { createAuditLog } = require('../services/auditService');

// GET /departments
async function listDepartments(req, res) {
  const prisma = getPrisma();
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  return res.status(200).json({ success: true, data: departments });
}

// GET /departments/:id
async function getDepartment(req, res) {
  const prisma = getPrisma();
  const dept = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'DEPARTMENT_NOT_FOUND', message: 'Department not found.' } });
  return res.status(200).json({ success: true, data: dept });
}

// PATCH /departments/:id  (super_admin - update SLA config)
async function updateDepartment(req, res) {
  const { sla_config, name, description } = req.body;
  const prisma = getPrisma();
  const data = {};
  if (sla_config) data.slaConfig = sla_config;
  if (name) data.name = name;
  if (description) data.description = description;

  const dept = await prisma.department.update({ where: { id: req.params.id }, data });
  await createAuditLog({ actorId: req.user.sub, action: 'DEPT_SLA_UPDATED', resourceType: 'department', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.headers['user-agent'], payload: { sla_config } });
  return res.status(200).json({ success: true, data: dept });
}

// GET /departments/:id/staff
async function getDeptStaff(req, res) {
  const prisma = getPrisma();
  const staff = await prisma.user.findMany({
    where: { departmentId: req.params.id, role: { in: ['staff', 'dept_admin'] } },
    select: { id: true, fullName: true, email: true, role: true, isActive: true },
  });
  return res.status(200).json({ success: true, data: staff });
}

module.exports = { listDepartments, getDepartment, updateDepartment, getDeptStaff };
