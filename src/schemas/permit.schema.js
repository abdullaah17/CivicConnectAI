const { z } = require('zod');

const createPermitSchema = z.object({
  permit_type: z.enum(['construction_permit', 'event_permit', 'business_license_renewal']),
  form_data: z.record(z.unknown()).default({}),
});

const updateDraftSchema = z.object({
  form_data: z.record(z.unknown()),
});

const permitStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'document_verification',
    'field_inspection_scheduled',
    'approved',
    'rejected',
  ]),
  rejection_reason: z.string().max(1000).optional(),
});

module.exports = { createPermitSchema, updateDraftSchema, permitStatusSchema };
