require('dotenv').config();
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const pinoHttp = require('pino-http');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/corsOptions');
const requestId = require('./middleware/requestId');
const sanitizeBody = require('./middleware/sanitize');
const globalErrorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/index');

const app = express();

// -- Security headers --------------------------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// -- CORS --------------------------------------------------
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// -- Request ID --------------------------------------------
app.use(requestId);

// -- Structured request logging ----------------------------
app.use(pinoHttp({ logger }));

// -- Body parsing ------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// -- Compression -------------------------------------------
app.use(compression());

// -- Input sanitization ------------------------------------
app.use(sanitizeBody);

// -- Health check (unauthenticated) ------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// -- API routes --------------------------------------------
app.use('/api/v1', apiRoutes);

// -- 404 handler -------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found.` } });
});

// -- Global error handler ----------------------------------
app.use(globalErrorHandler);

module.exports = app;
