const { createAuditLog } = require('../services/auditService');

const ALLOWED_IPS = process.env.SUPER_ADMIN_ALLOWED_IPS?.split(',').map((ip) => ip.trim()) ?? [];

/**
 * Restricts super_admin access to whitelisted IPs.
 * Applied after authenticate middleware.
 */
async function ipRestrict(req, res, next) {
  if (req.user?.role !== 'super_admin') return next();

  const clientIp = req.ip || req.socket?.remoteAddress || '';
  if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIp)) {
    try {
      await createAuditLog({
        actorId: req.user.id,
        action: 'LOGIN_BLOCKED_IP',
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'],
        payload: { ip: clientIp },
      });
    } catch (_) { /* non-blocking */ }

    return res.status(403).json({
      success: false,
      error: { code: 'IP_RESTRICTED', message: 'Access denied from this IP address.' },
    });
  }
  next();
}

module.exports = ipRestrict;
