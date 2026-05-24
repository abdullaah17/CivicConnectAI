const { getPrisma } = require('../services/prismaService');
const { generateTicketId } = require('../utils/generateTicketId');
const { calculateSlaDeadline, getSlaStatus } = require('../utils/slaUtils');
const { dispatchNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const TRANSITION_MAP = {
  submitted:    ['under_review'],
  under_review: ['assigned', 'under_review'],
  assigned:     ['in_progress', 'under_review'],
  in_progress:  ['resolved', 'assigned'],
  resolved:     ['closed'],
  closed:       [],
};

function isValidTransition(currentStatus, newStatus, role) {
  const allowed = TRANSITION_MAP[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) return false;
  if (newStatus === 'closed' && !['dept_admin', 'super_admin'].includes(role)) return false;
  return true;
}

// GET /tickets
async function listTickets(req, res) {
  const { status, priority, category, page = 1, limit = 20, department_id } = req.query;
  const prisma = getPrisma();
  const { role, sub: userId, department_id: userDeptId } = req.user;

  const where = {};
  if (role === 'resident') where.residentId = userId;
  else if (role === 'staff') where.departmentId = userDeptId;
  else if (role === 'dept_admin') where.departmentId = req.scopedDepartmentId || userDeptId;
  else if (role === 'super_admin' && department_id) where.departmentId = department_id;

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where, skip, take: Number(limit),
      include: { department: { select: { id: true, name: true, code: true } }, resident: { select: { id: true, fullName: true } }, assignee: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.count({ where }),
  ]);

  const enriched = tickets.map((t) => ({ ...t, sla_status: getSlaStatus(t.slaDeadline) }));
  return res.status(200).json({ success: true, data: enriched, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

// POST /tickets
async function createTicket(req, res) {
  const { title, description, department_id, category, location, priority, attachment_urls = [], location_lat, location_lng } = req.body;
  const prisma = getPrisma();

  const department = await prisma.department.findUnique({ where: { id: department_id } });
  if (!department) return res.status(404).json({ success: false, error: { code: 'DEPARTMENT_NOT_FOUND', message: 'Department not found.' } });

  const ticketNumber = await generateTicketId(department.code, prisma);
  const slaDeadline = calculateSlaDeadline(department.slaConfig, priority, new Date());

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber, title, description, category, priority, location,
      locationLat: location_lat || null, locationLng: location_lng || null,
      departmentId: department_id, residentId: req.user.sub, slaDeadline,
      attachments: attachment_urls.length > 0 ? {
        create: attachment_urls.map((url) => ({ fileUrl: url, fileType: 'image/jpeg', fileName: url.split('/').pop(), fileSizeBytes: 0 })),
      } : undefined,
    },
    include: { department: { select: { id: true, name: true, code: true } }, attachments: true },
  });

  await prisma.ticketStatusHistory.create({
    data: { ticketId: ticket.id, toStatus: 'submitted', changedBy: req.user.sub, note: 'Ticket submitted' },
  });

  return res.status(201).json({ success: true, data: { ...ticket, sla_status: getSlaStatus(ticket.slaDeadline) } });
}

// GET /tickets/:id
async function getTicket(req, res) {
  const prisma = getPrisma();
  const { role, sub: userId, department_id: userDeptId } = req.user;

  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      department: true, resident: { select: { id: true, fullName: true, email: true } },
      assignee: { select: { id: true, fullName: true } }, attachments: true,
    },
  });

  if (!ticket) return res.status(404).json({ success: false, error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found.' } });
  if (role === 'resident' && ticket.residentId !== userId) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  if (role === 'staff' && ticket.departmentId !== userDeptId) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  if (role === 'dept_admin' && ticket.departmentId !== userDeptId) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });

  return res.status(200).json({ success: true, data: { ...ticket, sla_status: getSlaStatus(ticket.slaDeadline) } });
}

// PATCH /tickets/:id/status
async function updateStatus(req, res) {
  const { status: newStatus, public_note } = req.body;
  const prisma = getPrisma();
  const { role, sub: userId } = req.user;

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ success: false, error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found.' } });

  if (!isValidTransition(ticket.status, newStatus, role)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS_TRANSITION', message: `Cannot transition from ${ticket.status} to ${newStatus}.` } });
  }

  const [updated] = await prisma.$transaction([
    prisma.ticket.update({ where: { id: ticket.id }, data: { status: newStatus } }),
    prisma.ticketStatusHistory.create({ data: { ticketId: ticket.id, fromStatus: ticket.status, toStatus: newStatus, changedBy: userId, note: public_note || null } }),
  ]);

  // Notify resident
  await dispatchNotification({ userId: ticket.residentId, type: 'ticket_status_change', title: 'Ticket Status Updated', message: `Your ticket ${ticket.ticketNumber} is now ${newStatus}.`, referenceId: ticket.id, referenceType: 'ticket' });

  const { getIo } = require('../sockets');
  const io = getIo();
  if (io) io.to(`user:${ticket.residentId}`).emit('ticket:status_updated', { ticket_id: ticket.id, ticket_number: ticket.ticketNumber, new_status: newStatus, updated_at: new Date() });

  const historyEntry = await prisma.ticketStatusHistory.findFirst({ where: { ticketId: ticket.id, toStatus: newStatus }, orderBy: { changedAt: 'desc' }, include: { changer: { select: { id: true, fullName: true } } } });

  return res.status(200).json({ success: true, data: { id: ticket.id, ticket_number: ticket.ticketNumber, status: newStatus, updated_at: new Date(), history_entry: historyEntry } });
}

// PATCH /tickets/:id/assign
async function assignTicket(req, res) {
  const { assigned_to } = req.body;
  const prisma = getPrisma();

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ success: false, error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found.' } });

  const staff = await prisma.user.findUnique({ where: { id: assigned_to } });
  if (!staff || !['staff', 'dept_admin'].includes(staff.role)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ASSIGNEE', message: 'Assignee must be a staff member.' } });
  }

  const updated = await prisma.ticket.update({ where: { id: ticket.id }, data: { assignedTo: assigned_to, status: 'assigned' } });
  await prisma.ticketStatusHistory.create({ data: { ticketId: ticket.id, fromStatus: ticket.status, toStatus: 'assigned', changedBy: req.user.sub, note: `Assigned to ${staff.fullName}` } });

  await dispatchNotification({ userId: assigned_to, type: 'ticket_assigned', title: 'Ticket Assigned to You', message: `Ticket ${ticket.ticketNumber} has been assigned to you.`, referenceId: ticket.id, referenceType: 'ticket' });

  return res.status(200).json({ success: true, data: updated });
}

// GET /tickets/:id/comments
async function getComments(req, res) {
  const prisma = getPrisma();
  const { role } = req.user;

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ success: false, error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found.' } });

  const where = { ticketId: req.params.id };
  if (role === 'resident') where.isInternal = false;

  const comments = await prisma.ticketComment.findMany({
    where, include: { author: { select: { id: true, fullName: true, role: true } } }, orderBy: { createdAt: 'asc' },
  });
  return res.status(200).json({ success: true, data: comments });
}

// POST /tickets/:id/comments
async function addComment(req, res) {
  const { body, is_internal = false } = req.body;
  const prisma = getPrisma();
  const { role, sub: userId } = req.user;

  if (is_internal && role === 'resident') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Residents cannot add internal notes.' } });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ success: false, error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found.' } });

  const comment = await prisma.ticketComment.create({
    data: { ticketId: req.params.id, authorId: userId, body, isInternal: is_internal },
    include: { author: { select: { id: true, fullName: true, role: true } } },
  });

  if (!is_internal && userId !== ticket.residentId) {
    await dispatchNotification({ userId: ticket.residentId, type: 'ticket_comment', title: 'New Comment on Your Ticket', message: `A new comment was added to ticket ${ticket.ticketNumber}.`, referenceId: ticket.id, referenceType: 'ticket' });
  }

  return res.status(201).json({ success: true, data: comment });
}

// GET /tickets/:id/history
async function getHistory(req, res) {
  const prisma = getPrisma();
  const history = await prisma.ticketStatusHistory.findMany({
    where: { ticketId: req.params.id },
    include: { changer: { select: { id: true, fullName: true, role: true } } },
    orderBy: { changedAt: 'asc' },
  });
  return res.status(200).json({ success: true, data: history });
}

// GET /tickets/:id/attachments
async function getAttachments(req, res) {
  const prisma = getPrisma();
  const attachments = await prisma.ticketAttachment.findMany({ where: { ticketId: req.params.id } });
  return res.status(200).json({ success: true, data: attachments });
}

// POST /tickets/upload
async function uploadAttachment(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded.' } });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'ticket-attachments' }, (err, r) => err ? reject(err) : resolve(r));
    stream.end(req.file.buffer);
  });

  return res.status(200).json({ success: true, data: { file_url: result.secure_url, cloudinary_id: result.public_id, file_type: req.file.mimetype, file_name: req.file.originalname, file_size_bytes: req.file.size } });
}

// GET /tickets/my
async function myTickets(req, res) {
  req.query.page = req.query.page || 1;
  return listTickets(req, res);
}

// GET /tickets/my-stats  (resident only — counts only their own tickets)
async function getResidentStats(req, res) {
  const prisma = getPrisma();
  const userId = req.user.sub;   // JWT stores userId as 'sub'

  const [total, open, inProgress, resolved, closed] = await Promise.all([
    prisma.ticket.count({ where: { residentId: userId } }),
    prisma.ticket.count({ where: { residentId: userId, status: 'submitted' } }),
    prisma.ticket.count({ where: { residentId: userId, status: 'in_progress' } }),
    prisma.ticket.count({ where: { residentId: userId, status: 'resolved' } }),
    prisma.ticket.count({ where: { residentId: userId, status: 'closed' } }),
  ]);

  return res.status(200).json({
    success: true,
    data: { total, open, in_progress: inProgress, resolved, closed },
  });
}

// GET /tickets/stats  (staff / dept_admin / super_admin)
async function getStats(req, res) {
  const prisma = getPrisma();
  const { role, department_id: userDeptId } = req.user;
  const deptId = role === 'super_admin' ? req.query.department_id : userDeptId;
  const where = deptId ? { departmentId: deptId } : {};

  const [byStatus, total, slaBreached] = await Promise.all([
    prisma.ticket.groupBy({ by: ['status'], where, _count: { status: true } }),
    prisma.ticket.count({ where }),
    prisma.ticket.count({
      where: {
        ...where,
        slaDeadline: { lt: new Date() },
        status: { notIn: ['resolved', 'closed'] },
      },
    }),
  ]);

  const statusMap = {};
  byStatus.forEach((r) => { statusMap[r.status] = r._count.status; });

  return res.status(200).json({
    success: true,
    data: { total, by_status: statusMap, sla_breached: slaBreached },
  });
}

module.exports = { listTickets, createTicket, getTicket, updateStatus, assignTicket, getComments, addComment, getHistory, getAttachments, uploadAttachment, myTickets, getStats, getResidentStats };
