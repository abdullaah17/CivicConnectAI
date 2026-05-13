const { getPrisma } = require('../services/prismaService');
const { getIo } = require('../sockets');

// GET /announcements
async function listAnnouncements(req, res) {
  const { category, priority, page = 1, limit = 20 } = req.query;
  const prisma = getPrisma();
  const where = { isArchived: false };
  if (category) where.category = category;
  if (priority) where.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);
  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({ where, skip, take: Number(limit), include: { author: { select: { id: true, fullName: true } }, department: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.announcement.count({ where }),
  ]);
  return res.status(200).json({ success: true, data: announcements, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

// POST /announcements
async function createAnnouncement(req, res) {
  const { title, body, category, priority, expiry_date, department_id } = req.body;
  const prisma = getPrisma();
  const isEmergency = priority === 'emergency';

  const announcement = await prisma.announcement.create({
    data: { authorId: req.user.sub, title, body, category, priority, isEmergency, expiryDate: expiry_date ? new Date(expiry_date) : null, departmentId: department_id || null },
    include: { author: { select: { id: true, fullName: true } } },
  });

  if (isEmergency) {
    const io = getIo();
    if (io) io.emit('announcement:emergency', { id: announcement.id, title, body, created_at: announcement.createdAt });
  }

  return res.status(201).json({ success: true, data: announcement });
}

// GET /announcements/:id
async function getAnnouncement(req, res) {
  const prisma = getPrisma();
  const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id }, include: { author: { select: { id: true, fullName: true } }, department: { select: { id: true, name: true } } } });
  if (!announcement) return res.status(404).json({ success: false, error: { code: 'ANNOUNCEMENT_NOT_FOUND', message: 'Announcement not found.' } });
  return res.status(200).json({ success: true, data: announcement });
}

// PATCH /announcements/:id
async function updateAnnouncement(req, res) {
  const { title, body, category, priority, expiry_date, department_id } = req.body;
  const prisma = getPrisma();
  const data = {};
  if (title !== undefined) data.title = title;
  if (body !== undefined) data.body = body;
  if (category !== undefined) data.category = category;
  if (priority !== undefined) { data.priority = priority; data.isEmergency = priority === 'emergency'; }
  if (expiry_date !== undefined) data.expiryDate = expiry_date ? new Date(expiry_date) : null;
  if (department_id !== undefined) data.departmentId = department_id || null;

  const updated = await prisma.announcement.update({ where: { id: req.params.id }, data });
  return res.status(200).json({ success: true, data: updated });
}

// DELETE /announcements/:id
async function deleteAnnouncement(req, res) {
  const prisma = getPrisma();
  await prisma.announcement.update({ where: { id: req.params.id }, data: { isArchived: true } });
  return res.status(200).json({ success: true, data: { message: 'Announcement archived.' } });
}

// POST /announcements/:id/read
async function markRead(req, res) {
  const prisma = getPrisma();
  await prisma.announcementRead.upsert({
    where: { announcementId_userId: { announcementId: req.params.id, userId: req.user.sub } },
    create: { announcementId: req.params.id, userId: req.user.sub },
    update: {},
  });
  return res.status(200).json({ success: true, data: { message: 'Marked as read.' } });
}

// GET /announcements/unread-count
async function unreadCount(req, res) {
  const prisma = getPrisma();
  const total = await prisma.announcement.count({ where: { isArchived: false } });
  const read = await prisma.announcementRead.count({ where: { userId: req.user.sub } });
  return res.status(200).json({ success: true, data: { unread_count: Math.max(0, total - read) } });
}

// GET /announcements/archive
async function listArchive(req, res) {
  const prisma = getPrisma();
  const archived = await prisma.announcement.findMany({ where: { isArchived: true }, orderBy: { createdAt: 'desc' } });
  return res.status(200).json({ success: true, data: archived });
}

module.exports = { listAnnouncements, createAnnouncement, getAnnouncement, updateAnnouncement, deleteAnnouncement, markRead, unreadCount, listArchive };
