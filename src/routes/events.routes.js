const router = require('express').Router();
const ctrl = require('../controllers/events.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createEventSchema, updateEventSchema } = require('../schemas/event.schema');

// Public listing
router.get('/', asyncHandler(ctrl.listEvents));
router.get('/:id', asyncHandler(ctrl.getEvent));

router.use(authenticate);

router.post('/',                  authorize(['dept_admin','super_admin']), validate(createEventSchema), asyncHandler(ctrl.createEvent));
router.patch('/:id',              authorize(['dept_admin','super_admin']), validate(updateEventSchema), asyncHandler(ctrl.updateEvent));
router.delete('/:id',             authorize(['dept_admin','super_admin']),                              asyncHandler(ctrl.deleteEvent));
router.post('/:id/register',      authorize(['resident']),                                              asyncHandler(ctrl.registerForEvent));
router.delete('/:id/register',    authorize(['resident']),                                              asyncHandler(ctrl.cancelRegistration));
router.get('/:id/registrations',  authorize(['dept_admin','super_admin']),                              asyncHandler(ctrl.listRegistrations));

module.exports = router;
