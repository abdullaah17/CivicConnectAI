const { getPrisma } = require('../services/prismaService');

// GET /notifications
async function listNotifications(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const prisma = getPrisma();
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: req.user.sub }, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where: { userId: req.user.sub } }),
    prisma.notification.count({ where: { userId: req.user.sub, isRead: false } }),
  ]);

  res.setHeader('X-Unread-Count', unreadCount);
  return res.status(200).json({ success: true, data: notifications, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)), unread_count: unreadCount } });
}

// PATCH /notifications/:id/read
async function markRead(req, res) {
  const prisma = getPrisma();
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user.sub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found.' } });
  await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  return res.status(200).json({ success: true, data: { message: 'Marked as read.' } });
}

// PATCH /notifications/read-all
async function markAllRead(req, res) {
  const prisma = getPrisma();
  await prisma.notification.updateMany({ where: { userId: req.user.sub, isRead: false }, data: { isRead: true } });
  return res.status(200).json({ success: true, data: { message: 'All notifications marked as read.' } });
}

// GET /notifications/unread-count
async function unreadCount(req, res) {
  const prisma = getPrisma();
  const count = await prisma.notification.count({ where: { userId: req.user.sub, isRead: false } });
  return res.status(200).json({ success: true, data: { unread_count: count } });
}

module.exports = { listNotifications, markRead, markAllRead, unreadCount };
