const router = require('express').Router();
const ctrl = require('../controllers/tickets.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const enforceDeptScope = require('../middleware/departmentScope');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createTicketSchema, statusUpdateSchema, assignTicketSchema, commentSchema } = require('../schemas/ticket.schema');

router.use(authenticate);

// Order matters — specific paths before :id
router.get('/my',              authorize(['resident']),                                    asyncHandler(ctrl.myTickets));
router.get('/stats',           authorize(['staff','dept_admin','super_admin']),            asyncHandler(ctrl.getStats));
router.post('/upload',         authorize(['resident']), upload.single('file'),             asyncHandler(ctrl.uploadAttachment));
router.get('/',                enforceDeptScope,                                           asyncHandler(ctrl.listTickets));
router.post('/',               authorize(['resident']), validate(createTicketSchema),      asyncHandler(ctrl.createTicket));
router.get('/:id',             enforceDeptScope,                                           asyncHandler(ctrl.getTicket));
router.patch('/:id/status',    authorize(['staff','dept_admin','super_admin']), validate(statusUpdateSchema), asyncHandler(ctrl.updateStatus));
router.patch('/:id/assign',    authorize(['dept_admin','super_admin']), validate(assignTicketSchema),         asyncHandler(ctrl.assignTicket));
router.get('/:id/comments',    asyncHandler(ctrl.getComments));
router.post('/:id/comments',   validate(commentSchema),                                    asyncHandler(ctrl.addComment));
router.get('/:id/history',     asyncHandler(ctrl.getHistory));
router.get('/:id/attachments', asyncHandler(ctrl.getAttachments));

module.exports = router;
