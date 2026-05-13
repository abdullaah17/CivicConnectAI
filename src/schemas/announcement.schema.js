const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(20, 'Body must be at least 20 characters').max(5000),
  category: z.enum(['health', 'infrastructure', 'culture', 'emergency', 'general']),
  priority: z.enum(['normal', 'urgent', 'emergency']),
  expiry_date: z
    .string()
    .date()
    .optional()
    .refine((d) => !d || new Date(d) > new Date(), 'Expiry date must be in the future'),
  department_id: z.string().uuid().optional(),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

module.exports = { createAnnouncementSchema, updateAnnouncementSchema };
