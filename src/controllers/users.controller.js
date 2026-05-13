const { getPrisma } = require('../services/prismaService');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const cloudinary = require('../config/cloudinary');
const { createAuditLog } = require('../services/auditService');

// GET /users/me
async function getMe(req, res) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, fullName: true, email: true, role: true, departmentId: true, profilePhotoUrl: true, isActive: true, createdAt: true, department: { select: { id: true, name: true, code: true } } },
  });
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  return res.status(200).json({ success: true, data: user });
}

// PATCH /users/me
async function updateMe(req, res) {
  const { full_name, profile_photo_url } = req.body;
  const prisma = getPrisma();
  const data = {};
  if (full_name) data.fullName = full_name;
  if (profile_photo_url) data.profilePhotoUrl = profile_photo_url;

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data,
    select: { id: true, fullName: true, email: true, role: true, profilePhotoUrl: true },
  });
  return res.status(200).json({ success: true, data: user });
}

// PATCH /users/me/password
async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });

  const valid = await comparePassword(current_password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect.' } });

  const passwordHash = await hashPassword(new_password);
  await prisma.user.update({ where: { id: req.user.sub }, data: { passwordHash } });
  return res.status(200).json({ success: true, data: { message: 'Password updated successfully.' } });
}

// GET /users  (super_admin)
async function listUsers(req, res) {
  const { role, department_id, page = 1, limit = 20 } = req.query;
  const prisma = getPrisma();
  const where = {};
  if (role) where.role = role;
  if (department_id) where.departmentId = department_id;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: Number(limit), select: { id: true, fullName: true, email: true, role: true, departmentId: true, isActive: true, createdAt: true, department: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return res.status(200).json({ success: true, data: users, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

// POST /users/staff
async function createStaff(req, res) {
  const { full_name, email, password, role, department_id } = req.body;
  const prisma = getPrisma();

  if (!['staff', 'dept_admin'].includes(role)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Role must be staff or dept_admin.' } });
  }

  // dept_admin can only create staff in their own department
  if (req.user.role === 'dept_admin' && department_id !== req.user.department_id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only create staff in your own department.' } });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email already in use.' } });

  const passwordHash = await hashPassword(password || 'TempPass@2026');
  const user = await prisma.user.create({
    data: { fullName: full_name, email, passwordHash, role, departmentId: department_id, otpVerified: true, isActive: true },
    select: { id: true, fullName: true, email: true, role: true, departmentId: true },
  });

  await createAuditLog({ actorId: req.user.sub, action: 'USER_CREATED', resourceType: 'user', resourceId: user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'], payload: { email, role } });
  return res.status(201).json({ success: true, data: user });
}

// PATCH /users/:id/status
async function updateStatus(req, res) {
  const { is_active } = req.body;
  const prisma = getPrisma();
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: is_active }, select: { id: true, fullName: true, isActive: true } });
  await createAuditLog({ actorId: req.user.sub, action: is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', resourceType: 'user', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  return res.status(200).json({ success: true, data: user });
}

// PATCH /users/:id/role
async function updateRole(req, res) {
  const { role, department_id } = req.body;
  const prisma = getPrisma();
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role, departmentId: department_id || null }, select: { id: true, fullName: true, role: true, departmentId: true } });
  await createAuditLog({ actorId: req.user.sub, action: 'USER_ROLE_CHANGED', resourceType: 'user', resourceId: req.params.id, ipAddress: req.ip, userAgent: req.headers['user-agent'], payload: { role, department_id } });
  return res.status(200).json({ success: true, data: user });
}

// GET /users/staff  (dept_admin)
async function listDeptStaff(req, res) {
  const prisma = getPrisma();
  const deptId = req.user.role === 'super_admin' ? req.query.department_id : req.user.department_id;
  const staff = await prisma.user.findMany({
    where: { departmentId: deptId, role: { in: ['staff', 'dept_admin'] } },
    select: { id: true, fullName: true, email: true, role: true, isActive: true },
  });
  return res.status(200).json({ success: true, data: staff });
}

module.exports = { getMe, updateMe, changePassword, listUsers, createStaff, updateStatus, updateRole, listDeptStaff };
