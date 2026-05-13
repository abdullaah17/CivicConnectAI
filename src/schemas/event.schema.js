const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['health', 'infrastructure', 'culture', 'emergency', 'general']),
  event_date: z
    .string()
    .datetime({ message: 'Invalid datetime format' })
    .refine((d) => new Date(d) > new Date(), 'Event date must be in the future'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  capacity: z.number().int().min(1).max(100000),
  department_id: z.string().uuid().optional(),
});

const updateEventSchema = createEventSchema.partial();

module.exports = { createEventSchema, updateEventSchema };
