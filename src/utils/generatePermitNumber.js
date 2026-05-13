/**
 * Generates a sequential permit number.
 * Format: PER-{YEAR}-{SEQ_5_DIGITS}  e.g. PER-2026-00089
 * Uses a simple DB sequence approach similar to ticket IDs.
 */
async function generatePermitNumber(prisma) {
  const year = new Date().getFullYear();

  // Reuse the PER sequence from ticket_sequences
  const updated = await prisma.$queryRaw`
    UPDATE ticket_sequences
    SET last_seq = last_seq + 1,
        year = ${year}
    WHERE department_code = 'PER'
    RETURNING last_seq
  `;

  const seq = Number(updated[0].last_seq);
  return `PER-${year}-${String(seq).padStart(5, '0')}`;
}

module.exports = { generatePermitNumber };
