const { z } = require('zod');

const slaConfigSchema = z.object({
  low: z.number().int().min(24).max(720),
  medium: z.number().int().min(8).max(168),
  high: z.number().int().min(2).max(48),
  emergency: z.number().int().min(1).max(4),
});

module.exports = { slaConfigSchema };
