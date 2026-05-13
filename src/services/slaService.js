const cron = require('node-cron');
const { getPrisma } = require('./prismaService');
const { dispatchNotification } = require('./notificationService');
const { sendEmail } = require('./emailService');
const logger = require('../utils/logger');

let io;
function setIo(socketIo) { io = socketIo; }

/**
 * Runs every 5 minutes. Finds tickets approaching or past SLA deadline
 * and sends alerts to dept admins.
 */
function startSlaMonitor() {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('SLA monitor cron running');
    const prisma = getPrisma();
    try {
      const now = new Date();
      const warningWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

      const breachingTickets = await prisma.ticket.findMany({
        where: {
          status: { notIn: ['resolved', 'closed'] },
          slaDeadline: { lte: warningWindow },
          escalationSent: false,
        },
        include: { department: true, resident: true },
      });

      for (const ticket of breachingTickets) {
        const admins = await prisma.user.findMany({
          where: { role: 'dept_admin', departmentId: ticket.departmentId, isActive: true },
        });

        for (const admin of admins) {
          await dispatchNotification({
            userId: admin.id,
            type: 'sla_breach_alert',
            title: 'SLA Breach Imminent',
            message: `Ticket ${ticket.ticketNumber} SLA expires at ${ticket.slaDeadline.toISOString()}.`,
            referenceId: ticket.id,
            referenceType: 'ticket',
          });

          sendEmail({
            to: admin.email,
            subject: `[URGENT] SLA Breach Alert — ${ticket.ticketNumber}`,
            template: 'sla-breach-alert',
            data: {
              ADMIN_NAME: admin.fullName,
              TICKET_NUMBER: ticket.ticketNumber,
              TICKET_TITLE: ticket.title,
              SLA_DEADLINE: ticket.slaDeadline.toISOString(),
            },
          });

          if (io) {
            io.to(`user:${admin.id}`).emit('sla:breach_alert', {
              ticket_number: ticket.ticketNumber,
              sla_deadline: ticket.slaDeadline,
            });
          }
        }

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { escalationSent: true },
        });
      }

      if (breachingTickets.length > 0) {
        logger.warn({ msg: 'SLA alerts sent', count: breachingTickets.length });
      }
    } catch (err) {
      logger.error({ msg: 'SLA cron error', error: err.message });
    }
  });

  logger.info('SLA monitor scheduled (every 5 minutes)');
}

module.exports = { startSlaMonitor, setIo };
