const { getPrisma } = require('./prismaService');

/**
 * Streams a CSV export for the requested dataset.
 * Supported datasets: 'tickets', 'permits', 'users'
 */
async function exportCsv(res, { dataset, departmentId, startDate, endDate, role }) {
  const prisma = getPrisma();
  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${dataset}-export.csv"`);

  if (dataset === 'tickets') {
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (startDate || endDate) where.createdAt = dateFilter;

    const tickets = await prisma.ticket.findMany({
      where,
      include: { department: true, resident: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Ticket Number,Title,Status,Priority,Category,Department,Resident,Assigned To,SLA Deadline,Created At\n';
    res.write(header);
    for (const t of tickets) {
      const row = [
        t.ticketNumber, `"${t.title}"`, t.status, t.priority, t.category,
        t.department?.name || '', t.resident?.fullName || '',
        t.assignee?.fullName || '', t.slaDeadline?.toISOString() || '',
        t.createdAt.toISOString(),
      ].join(',');
      res.write(row + '\n');
    }
  } else if (dataset === 'permits') {
    const where = {};
    if (startDate || endDate) where.createdAt = dateFilter;

    const permits = await prisma.permitApplication.findMany({
      where,
      include: { applicant: true },
      orderBy: { createdAt: 'desc' },
    });

    res.write('Permit Type,Status,Applicant,Fee Amount,Submitted At,Created At\n');
    for (const p of permits) {
      const row = [
        p.permitType, p.status, p.applicant?.fullName || '',
        p.feeAmount || 0, p.submittedAt?.toISOString() || '',
        p.createdAt.toISOString(),
      ].join(',');
      res.write(row + '\n');
    }
  } else if (dataset === 'users') {
    const users = await prisma.user.findMany({
      select: { fullName: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.write('Full Name,Email,Role,Active,Created At\n');
    for (const u of users) {
      res.write(`"${u.fullName}",${u.email},${u.role},${u.isActive},${u.createdAt.toISOString()}\n`);
    }
  } else {
    res.write('error\nUnsupported dataset\n');
  }

  res.end();
}

module.exports = { exportCsv };
