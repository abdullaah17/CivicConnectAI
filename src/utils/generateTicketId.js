const { PrismaClient } = require('@prisma/client');

/**
 * Generates a sequential, human-readable ticket ID.
 * Format: {DEPT_CODE}-{YEAR}-{SEQ_5_DIGITS}  e.g. INF-2026-00047
 * Uses a DB-level atomic counter to guarantee uniqueness.
 */
async function generateTicketId(departmentCode, prisma) {
  const year = new Date().getFullYear();

  const updated = await prisma.$queryRaw`
    UPDATE ticket_sequences
    SET last_seq = last_seq + 1,
        year = ${year}
    WHERE department_code = ${departmentCode}
    RETURNING last_seq
  `;

  if (!updated || updated.length === 0) {
    throw new Error(`No ticket sequence found for department code: ${departmentCode}`);
  }

  const seq = Number(updated[0].last_seq);
  return `${departmentCode}-${year}-${String(seq).padStart(5, '0')}`;
}

module.exports = { generateTicketId };
