const PDFDocument = require('pdfkit');
const { getPrisma } = require('./prismaService');

/**
 * Generates an analytics PDF report and pipes it to the response.
 */
async function generatePdfReport(res, { departmentId, startDate, endDate }) {
  const prisma = getPrisma();
  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (startDate || endDate) where.createdAt = dateFilter;

  const [totalTickets, resolvedTickets, department] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { ...where, status: { in: ['resolved', 'closed'] } } }),
    departmentId ? prisma.department.findUnique({ where: { id: departmentId } }) : null,
  ]);

  const byStatus = await prisma.ticket.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('CivicConnect Analytics Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`);
  if (department) doc.text(`Department: ${department.name}`);
  if (startDate) doc.text(`Period: ${startDate} to ${endDate || 'now'}`);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('Ticket Summary');
  doc.fontSize(12).font('Helvetica');
  doc.text(`Total Tickets: ${totalTickets}`);
  doc.text(`Resolved/Closed: ${resolvedTickets}`);
  doc.text(`Resolution Rate: ${totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0}%`);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('By Status');
  doc.fontSize(12).font('Helvetica');
  for (const row of byStatus) {
    doc.text(`  ${row.status}: ${row._count.status}`);
  }

  doc.end();
}

module.exports = { generatePdfReport };
