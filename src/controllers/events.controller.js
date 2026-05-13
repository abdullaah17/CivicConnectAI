const { getPrisma } = require('../services/prismaService');
const { dispatchNotification } = require('../services/notificationService');

// GET /events
async function listEvents(req, res) {
  const { category, department_id, page = 1, limit = 20 } = req.query;
  const prisma = getPrisma();
  const where = { isCancelled: false };
  if (category) where.category = category;
  if (department_id) where.departmentId = department_id;

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    prisma.event.findMany({ where, skip, take: Number(limit), include: { creator: { select: { id: true, fullName: true } }, department: { select: { id: true, name: true } }, _count: { select: { registrations: true } } }, orderBy: { eventDate: 'asc' } }),
    prisma.event.count({ where }),
  ]);
  return res.status(200).json({ success: true, data: events, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
}

// POST /events
async function createEvent(req, res) {
  const { title, description, category, event_date, location, capacity, department_id } = req.body;
  const prisma = getPrisma();
  const event = await prisma.event.create({
    data: { createdBy: req.user.sub, title, description, category, eventDate: new Date(event_date), location, capacity, departmentId: department_id || null },
  });
  return res.status(201).json({ success: true, data: event });
}

// GET /events/:id
async function getEvent(req, res) {
  const prisma = getPrisma();
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { creator: { select: { id: true, fullName: true } }, department: { select: { id: true, name: true } }, _count: { select: { registrations: true } } },
  });
  if (!event) return res.status(404).json({ success: false, error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' } });
  return res.status(200).json({ success: true, data: event });
}

// PATCH /events/:id
async function updateEvent(req, res) {
  const { title, description, category, event_date, location, capacity, department_id } = req.body;
  const prisma = getPrisma();
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (event_date !== undefined) data.eventDate = new Date(event_date);
  if (location !== undefined) data.location = location;
  if (capacity !== undefined) data.capacity = capacity;
  if (department_id !== undefined) data.departmentId = department_id || null;

  const updated = await prisma.event.update({ where: { id: req.params.id }, data });
  return res.status(200).json({ success: true, data: updated });
}

// DELETE /events/:id
async function deleteEvent(req, res) {
  const prisma = getPrisma();
  await prisma.event.update({ where: { id: req.params.id }, data: { isCancelled: true } });
  return res.status(200).json({ success: true, data: { message: 'Event cancelled.' } });
}

// POST /events/:id/register
async function registerForEvent(req, res) {
  const prisma = getPrisma();
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event || event.isCancelled) return res.status(404).json({ success: false, error: { code: 'EVENT_NOT_FOUND', message: 'Event not found or cancelled.' } });

  const count = await prisma.eventRegistration.count({ where: { eventId: req.params.id } });
  if (count >= event.capacity) return res.status(409).json({ success: false, error: { code: 'EVENT_FULL', message: 'This event has reached maximum capacity.' } });

  const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: req.params.id, userId: req.user.sub } } });
  if (existing) return res.status(409).json({ success: false, error: { code: 'ALREADY_REGISTERED', message: 'You are already registered for this event.' } });

  await prisma.eventRegistration.create({ data: { eventId: req.params.id, userId: req.user.sub } });
  await dispatchNotification({ userId: req.user.sub, type: 'event_registration_confirmed', title: 'Event Registration Confirmed', message: `You are registered for: ${event.title}`, referenceId: event.id, referenceType: 'event' });

  return res.status(201).json({ success: true, data: { message: 'Successfully registered for event.' } });
}

// DELETE /events/:id/register
async function cancelRegistration(req, res) {
  const prisma = getPrisma();
  await prisma.eventRegistration.delete({ where: { eventId_userId: { eventId: req.params.id, userId: req.user.sub } } });
  return res.status(200).json({ success: true, data: { message: 'Registration cancelled.' } });
}

// GET /events/:id/registrations
async function listRegistrations(req, res) {
  const prisma = getPrisma();
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: req.params.id },
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { registeredAt: 'asc' },
  });
  return res.status(200).json({ success: true, data: registrations });
}

module.exports = { listEvents, createEvent, getEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration, listRegistrations };
