const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');
const { getPrisma } = require('./prismaService');
const { generatePermitNumber } = require('../utils/generatePermitNumber');
const logger = require('../utils/logger');

function calculateExpiryDate(permitType) {
  const expiry = new Date();
  if (permitType === 'business_license_renewal') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else if (permitType === 'construction_permit') {
    expiry.setFullYear(expiry.getFullYear() + 2);
  } else {
    expiry.setMonth(expiry.getMonth() + 6);
  }
  return expiry;
}

async function generatePermitCertificate(applicationId) {
  const prisma = getPrisma();

  const application = await prisma.permitApplication.findUnique({
    where: { id: applicationId },
    include: { applicant: true },
  });

  if (!application) throw new Error('Application not found');

  const permitNumber = await generatePermitNumber(prisma);
  const expiryDate = calculateExpiryDate(application.permitType);
  const verifyUrl = `${process.env.FRONTEND_URL}/verify/${permitNumber}`;

  // Generate QR code buffer
  const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 150 });

  // Build PDF in memory
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('CivicConnect', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('City Government Portal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).font('Helvetica-Bold').text('PERMIT CERTIFICATE', { align: 'center' });
    doc.moveDown();

    // Details
    doc.fontSize(12).font('Helvetica');
    doc.text(`Permit Number: ${permitNumber}`);
    doc.text(`Permit Type: ${application.permitType.replace(/_/g, ' ').toUpperCase()}`);
    doc.text(`Applicant: ${application.applicant.fullName}`);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Expiry Date: ${expiryDate.toLocaleDateString()}`);
    doc.moveDown();

    // QR Code
    doc.image(qrBuffer, { fit: [100, 100], align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Verify at: ${verifyUrl}`, { align: 'center' });

    doc.end();
  });

  // Upload PDF to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'certificates', resource_type: 'raw', public_id: permitNumber, format: 'pdf' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(pdfBuffer);
  });

  // Upload QR code image
  const qrResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'qrcodes', public_id: `qr_${permitNumber}` },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(qrBuffer);
  });

  // Save certificate record
  const certificate = await prisma.permitCertificate.create({
    data: {
      applicationId,
      permitNumber,
      certificateUrl: uploadResult.secure_url,
      qrCodeUrl: qrResult.secure_url,
      expiryDate,
    },
  });

  logger.info({ msg: 'Permit certificate generated', permitNumber });
  return certificate;
}

module.exports = { generatePermitCertificate };
