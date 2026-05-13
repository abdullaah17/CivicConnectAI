const { getPrisma } = require('../services/prismaService');
const { calculateFee, getPermitTypes } = require('../services/permitFeeService');
const { generatePermitCertificate } = require('../services/certificateService');
const { dispatchNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const cloudinary = require('../config/cloudinary');

// GET /permits
async function listPermits(req, res) {
  const { status, permit_type, page = 1, limit = 20 } = req.query;
  const prisma = getPrisma();
  const { role, sub: userId } = req.user;

  const where = {};
  if (role === 'resident') where.applicantId = userId;
  if (status) where.status = status;
  if (permit_type) where.permitType = permit_type;

  const skip = (Number(page) - 1) * Number(limit);
  const [permits, total] = await Promise.all([
    prisma.permitApplication.findMany({ where, skip, take: Number(limit), include: { applicant: { select: { id: true, fullName: true } }, certificate: true }, orderBy: { createdAt: 'desc' } }),
    prisma.permitApplication.count({ where }),
  ]);
  return res.status(200).json({ success: true, data: permits, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

// GET /permits/types
async function getTypes(req, res) {
  return res.status(200).json({ success: true, data: getPermitTypes() });
}

// POST /permits
async function createPermit(req, res) {
  const { permit_type, form_data = {} } = req.body;
  const prisma = getPrisma();
  const feeAmount = calculateFee(permit_type, form_data);

  const permit = await prisma.permitApplication.create({
    data: { applicantId: req.user.sub, permitType: permit_type, formData: form_data, feeAmount, status: 'draft' },
  });
  return res.status(201).json({ success: true, data: permit });
}

// GET /permits/:id
async function getPermit(req, res) {
  const prisma = getPrisma();
  const { role, sub: userId } = req.user;

  const permit = await prisma.permitApplication.findUnique({
    where: { id: req.params.id },
    include: { applicant: { select: { id: true, fullName: true, email: true } }, documents: true, certificate: true, reviewer: { select: { id: true, fullName: true } } },
  });
  if (!permit) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit application not found.' } });
  if (role === 'resident' && permit.applicantId !== userId) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });

  return res.status(200).json({ success: true, data: permit });
}

// PATCH /permits/:id/draft
async function saveDraft(req, res) {
  const { form_data } = req.body;
  const prisma = getPrisma();

  const permit = await prisma.permitApplication.findUnique({ where: { id: req.params.id } });
  if (!permit) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit not found.' } });
  if (permit.applicantId !== req.user.sub) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  if (permit.status !== 'draft') return res.status(422).json({ success: false, error: { code: 'NOT_DRAFT', message: 'Only draft applications can be edited.' } });

  const feeAmount = calculateFee(permit.permitType, form_data);
  const updated = await prisma.permitApplication.update({
    where: { id: req.params.id },
    data: { formData: form_data, feeAmount, draftSavedAt: new Date() },
  });
  return res.status(200).json({ success: true, data: updated });
}

// POST /permits/:id/submit
async function submitPermit(req, res) {
  const prisma = getPrisma();
  const permit = await prisma.permitApplication.findUnique({ where: { id: req.params.id } });
  if (!permit) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit not found.' } });
  if (permit.applicantId !== req.user.sub) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
  if (permit.status !== 'draft') return res.status(422).json({ success: false, error: { code: 'NOT_DRAFT', message: 'Only draft applications can be submitted.' } });

  const updated = await prisma.permitApplication.update({
    where: { id: req.params.id },
    data: { status: 'submitted', submittedAt: new Date() },
  });
  return res.status(200).json({ success: true, data: updated });
}

// PATCH /permits/:id/status
async function updateStatus(req, res) {
  const { status, rejection_reason } = req.body;
  const prisma = getPrisma();

  const permit = await prisma.permitApplication.findUnique({ where: { id: req.params.id }, include: { applicant: true } });
  if (!permit) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit not found.' } });

  const data = { status, reviewedBy: req.user.sub, reviewedAt: new Date() };
  if (rejection_reason) data.rejectionReason = rejection_reason;

  const updated = await prisma.permitApplication.update({ where: { id: req.params.id }, data });

  const notifType = status === 'approved' ? 'permit_approved' : status === 'rejected' ? 'permit_rejected' : 'permit_status_change';
  await dispatchNotification({ userId: permit.applicantId, type: notifType, title: `Permit ${status.charAt(0).toUpperCase() + status.slice(1)}`, message: `Your permit application status is now: ${status}.`, referenceId: permit.id, referenceType: 'permit' });

  if (status === 'approved') {
    try { await generatePermitCertificate(permit.id); } catch (e) { /* log but don't fail */ }
  }

  return res.status(200).json({ success: true, data: updated });
}

// POST /permits/:id/documents
async function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded.' } });
  const prisma = getPrisma();

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'permit-documents', resource_type: 'auto' }, (err, r) => err ? reject(err) : resolve(r));
    stream.end(req.file.buffer);
  });

  const doc = await prisma.permitDocument.create({
    data: { applicationId: req.params.id, fileUrl: result.secure_url, fileName: req.file.originalname, fileType: req.file.mimetype, fileSizeBytes: req.file.size, cloudinaryId: result.public_id },
  });
  return res.status(201).json({ success: true, data: doc });
}

// GET /permits/:id/certificate
async function getCertificate(req, res) {
  const prisma = getPrisma();
  const cert = await prisma.permitCertificate.findFirst({ where: { applicationId: req.params.id } });
  if (!cert) return res.status(404).json({ success: false, error: { code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not yet generated.' } });
  return res.redirect(cert.certificateUrl);
}

// GET /permits/:id/receipt
async function getReceipt(req, res) {
  const prisma = getPrisma();
  const permit = await prisma.permitApplication.findUnique({ where: { id: req.params.id }, include: { applicant: true } });
  if (!permit) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit not found.' } });
  return res.status(200).json({ success: true, data: { permit_id: permit.id, fee_amount: permit.feeAmount, applicant: permit.applicant.fullName, submitted_at: permit.submittedAt } });
}

// GET /permits/verify/:permitNumber  (public)
async function verifyPermit(req, res) {
  const prisma = getPrisma();
  const cert = await prisma.permitCertificate.findUnique({
    where: { permitNumber: req.params.permitNumber },
    include: { application: { include: { applicant: { select: { fullName: true } } } } },
  });
  if (!cert) return res.status(404).json({ success: false, error: { code: 'PERMIT_NOT_FOUND', message: 'Permit not found.' } });

  const isExpired = cert.expiryDate < new Date();
  return res.status(200).json({
    success: true,
    data: {
      permit_number: cert.permitNumber,
      permit_type: cert.application.permitType,
      status: isExpired ? 'expired' : 'valid',
      expiry_date: cert.expiryDate,
      applicant_name: cert.application.applicant.fullName,
    },
  });
}

module.exports = { listPermits, getTypes, createPermit, getPermit, saveDraft, submitPermit, updateStatus, uploadDocument, getCertificate, getReceipt, verifyPermit };
