const { z } = require('zod');

const createTicketSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  department_id: z.string().uuid('Invalid department ID'),
  category: z.string().min(1).max(100),
  location: z.string().min(5, 'Location must be at least 5 characters').max(300),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  attachment_urls: z.array(z.string().url()).max(5, 'Maximum 5 attachments allowed').optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed']),
  public_note: z.string().max(2000).optional(),
});

const assignTicketSchema = z.object({
  assigned_to: z.string().uuid('Invalid staff user ID'),
});

const commentSchema = z.object({
  body: z.string().min(5, 'Comment must be at least 5 characters').max(2000),
  is_internal: z.boolean().default(false),
});

module.exports = { createTicketSchema, statusUpdateSchema, assignTicketSchema, commentSchema };
