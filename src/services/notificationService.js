const { getPrisma } = require('./prismaService');
const logger = require('../utils/logger');

let io; // Socket.io instance - injected at startup

function setIo(socketIo) {
  io = socketIo;
}

/**
 * Creates a notification in the DB and pushes it via Socket.io.
 */
async function dispatchNotification({ userId, type, title, message, referenceId, referenceType }) {
  const prisma = getPrisma();

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
    },
  });

  if (io) {
    io.to(`user:${userId}`).emit('notification:new', {
      id: notification.id,
      type,
      title,
      message,
      referenceId,
      referenceType,
      created_at: notification.createdAt,
    });

    // Update unread badge count
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    io.to(`user:${userId}`).emit('unread_count', { count: unreadCount });
  }

  return notification;
}

module.exports = { dispatchNotification, setIo };
