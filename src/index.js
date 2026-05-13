const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSockets } = require('./sockets');
const { setIo: setNotifIo } = require('./services/notificationService');
const { setIo: setSlaIo, startSlaMonitor } = require('./services/slaService');
const { disconnectPrisma } = require('./services/prismaService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// -- Socket.io ---------------------------------------------
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? [],
    credentials: true,
  },
});

initSockets(io);
setNotifIo(io);
setSlaIo(io);

// -- SLA cron ----------------------------------------------
startSlaMonitor();

// -- Start server ------------------------------------------
server.listen(PORT, () => {
  logger.info(`CivicConnect API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// -- Graceful shutdown -------------------------------------
async function shutdown(signal) {
  logger.info(`${signal} received - shutting down gracefully`);
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ msg: 'Unhandled promise rejection', reason });
});

process.on('uncaughtException', (err) => {
  logger.error({ msg: 'Uncaught exception', error: err.message, stack: err.stack });
  process.exit(1);
});
