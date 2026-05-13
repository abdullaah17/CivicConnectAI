const { getPrisma } = require('../services/prismaService');
const { hashPassword, comparePassword, hashToken, compareToken } = require('../utils/hashUtils');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwtConfig');
const { sendEmail } = require('../services/emailService');
const { createAuditLog } = require('../services/auditService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function buildTokenPayload(user) {
  return {
    sub: user.id,
    role: user.role,
    department_id: user.departmentId || null,
    email: user.email,
  };
}

// POST /auth/register
async function register(req, res) {
  const { name, email, password } = req.body;
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email is already registered.' } });
  }

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const user = await prisma.user.create({
    data: { fullName: name, email, passwordHash, otpHash, otpExpiresAt, otpSentAt: new Date() },
  });

  sendEmail({
    to: email,
    subject: 'Verify your CivicConnect account',
    template: 'otp-verification',
    data: { NAME: name, OTP: otp, EXPIRES_MINUTES: '10' },
  });

  return res.status(201).json({
    success: true,
    data: { message: 'Registration successful. OTP sent to your email.', user_id: user.id, email },
  });
}

// POST /auth/verify-otp
async function verifyOtp(req, res) {
  const { user_id, otp } = req.body;
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  if (user.otpVerified) return res.status(400).json({ success: false, error: { code: 'ALREADY_VERIFIED', message: 'Account already verified.' } });

  if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
    return res.status(429).json({ success: false, error: { code: 'OTP_LOCKED', message: 'Too many failed attempts. Try again later.' } });
  }

  if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, error: { code: 'OTP_INVALID', message: 'OTP has expired. Please request a new one.' } });
  }

  const valid = await comparePassword(otp, user.otpHash);
  if (!valid) {
    const attempts = user.otpAttempts + 1;
    const lockData = attempts >= 3 ? { otpLockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {};
    await prisma.user.update({ where: { id: user_id }, data: { otpAttempts: attempts, ...lockData } });
    return res.status(400).json({ success: false, error: { code: 'OTP_INVALID', message: 'Invalid OTP code.' } });
  }

  await prisma.user.update({
    where: { id: user_id },
    data: { otpVerified: true, otpHash: null, otpExpiresAt: null, otpAttempts: 0, otpLockedUntil: null },
  });

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id });
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({ where: { id: user_id }, data: { refreshTokenHash: refreshHash, refreshTokenExpires: refreshExpires } });

  res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
  return res.status(200).json({
    success: true,
    data: {
      access_token: accessToken,
      user: { id: user.id, full_name: user.fullName, email: user.email, role: user.role, department_id: user.departmentId, profile_photo_url: user.profilePhotoUrl, otp_verified: true },
    },
  });
}

// POST /auth/resend-otp
async function resendOtp(req, res) {
  const { email } = req.body;
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'No account with that email.' } });
  if (user.otpVerified) return res.status(400).json({ success: false, error: { code: 'ALREADY_VERIFIED', message: 'Account already verified.' } });

  if (user.otpSentAt && (Date.now() - user.otpSentAt.getTime()) < 60 * 1000) {
    return res.status(429).json({ success: false, error: { code: 'RESEND_TOO_SOON', message: 'Please wait 60 seconds before requesting a new OTP.' } });
  }

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  await prisma.user.update({
    where: { email },
    data: { otpHash, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), otpSentAt: new Date(), otpAttempts: 0, otpLockedUntil: null },
  });

  sendEmail({ to: email, subject: 'Your new CivicConnect OTP', template: 'otp-verification', data: { NAME: user.fullName, OTP: otp, EXPIRES_MINUTES: '10' } });
  return res.status(200).json({ success: true, data: { message: 'OTP resent to your email.' } });
}

// POST /auth/login
async function login(req, res) {
  const { identifier, password } = req.body;
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
  if (!user) return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
  if (!user.isActive) return res.status(403).json({ success: false, error: { code: 'ACCOUNT_DEACTIVATED', message: 'Your account has been deactivated.' } });
  if (!user.otpVerified) return res.status(401).json({ success: false, error: { code: 'OTP_NOT_VERIFIED', message: 'Please verify your email before logging in.' } });

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    await createAuditLog({ actorId: user.id, action: 'LOGIN_FAILED', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
  }

  // Admins require 2FA
  if (['dept_admin', 'super_admin'].includes(user.role) && user.totpEnabled) {
    const tempToken = jwt.sign({ sub: user.id, purpose: '2fa' }, process.env.JWT_SECRET, { expiresIn: '5m' });
    return res.status(200).json({ success: true, data: { requires2FA: true, temp_token: tempToken } });
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id });
  const refreshHash = await hashToken(refreshToken);
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: refreshHash, refreshTokenExpires: refreshExpires, lastLoginAt: new Date(), lastLoginIp: req.ip },
  });

  if (user.role === 'super_admin') {
    await createAuditLog({ actorId: user.id, action: 'SUPER_ADMIN_LOGIN', ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  }

  res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
  return res.status(200).json({
    success: true,
    data: {
      access_token: accessToken,
      user: { id: user.id, full_name: user.fullName, email: user.email, role: user.role, department_id: user.departmentId, profile_photo_url: user.profilePhotoUrl, otp_verified: true },
    },
  });
}

// POST /auth/2fa/setup
async function setup2fa(req, res) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });

  const secret = speakeasy.generateSecret({ name: `${process.env.TOTP_ISSUER || 'CivicConnect'} (${user.email})`, length: 20 });
  const encrypted = encrypt(secret.base32);

  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: encrypted } });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  return res.status(200).json({ success: true, data: { qr_code: qrCodeUrl, secret: secret.base32 } });
}

// POST /auth/2fa/verify
async function verify2fa(req, res) {
  const { temp_token, totp_code } = req.body;
  const prisma = getPrisma();

  let decoded;
  try {
    decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired temp token.' } });
  }

  if (decoded.purpose !== '2fa') return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token purpose.' } });

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.totpSecret) return res.status(400).json({ success: false, error: { code: '2FA_NOT_SETUP', message: '2FA not configured.' } });

  const secret = decrypt(user.totpSecret);
  const valid = speakeasy.totp.verify({ secret, encoding: 'base32', token: totp_code, window: 1 });
  if (!valid) return res.status(401).json({ success: false, error: { code: 'INVALID_TOTP', message: 'Invalid authenticator code.' } });

  if (!user.totpEnabled) {
    await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id });
  const refreshHash = await hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: refreshHash, refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), lastLoginAt: new Date(), lastLoginIp: req.ip },
  });

  res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
  return res.status(200).json({
    success: true,
    data: {
      access_token: accessToken,
      user: { id: user.id, full_name: user.fullName, email: user.email, role: user.role, department_id: user.departmentId },
    },
  });
}

// POST /auth/refresh
async function refresh(req, res) {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token.' } });

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token.' } });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.refreshTokenHash || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token expired or revoked.' } });
  }

  const valid = await compareToken(token, user.refreshTokenHash);
  if (!valid) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token mismatch.' } });

  const newAccessToken = signAccessToken(buildTokenPayload(user));
  const newRefreshToken = signRefreshToken({ sub: user.id });
  const newHash = await hashToken(newRefreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newHash, refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  res.cookie('refresh_token', newRefreshToken, COOKIE_OPTS);
  return res.status(200).json({ success: true, data: { access_token: newAccessToken } });
}

// POST /auth/logout
async function logout(req, res) {
  const prisma = getPrisma();
  await prisma.user.update({ where: { id: req.user.sub }, data: { refreshTokenHash: null, refreshTokenExpires: null } });
  res.clearCookie('refresh_token');
  return res.status(200).json({ success: true, data: { message: 'Logged out successfully.' } });
}

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (user) {
    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    await prisma.user.update({
      where: { email },
      data: { otpHash, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), otpSentAt: new Date(), otpAttempts: 0 },
    });
    sendEmail({ to: email, subject: 'Reset your CivicConnect password', template: 'otp-verification', data: { NAME: user.fullName, OTP: otp, EXPIRES_MINUTES: '10' } });
  }

  return res.status(200).json({ success: true, data: { message: 'If that email exists, a reset OTP has been sent.' } });
}

// POST /auth/reset-password
async function resetPassword(req, res) {
  const { email, otp, password } = req.body;
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, error: { code: 'OTP_INVALID', message: 'OTP is invalid or expired.' } });
  }

  const valid = await comparePassword(otp, user.otpHash);
  if (!valid) return res.status(400).json({ success: false, error: { code: 'OTP_INVALID', message: 'Invalid OTP.' } });

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { email },
    data: { passwordHash, otpHash: null, otpExpiresAt: null, otpAttempts: 0, refreshTokenHash: null },
  });

  return res.status(200).json({ success: true, data: { message: 'Password reset successfully. Please log in.' } });
}

// AES-256 helpers for TOTP secret encryption (ASSUMPTION B-A06)
const ALGO = 'aes-256-cbc';
function getKey() { return crypto.scryptSync(process.env.JWT_SECRET, 'civicconnect-salt', 32); }
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}
function decrypt(data) {
  const [ivHex, encrypted] = data.split(':');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = { register, verifyOtp, resendOtp, login, setup2fa, verify2fa, refresh, logout, forgotPassword, resetPassword };
