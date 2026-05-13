const router = require('express').Router();
const ctrl = require('../controllers/announcements.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('../schemas/announcement.schema');

router.use(authenticate);

router.get('/unread-count', authorize(['resident']),                                asyncHandler(ctrl.unreadCount));
router.get('/archive',                                                              asyncHandler(ctrl.listArchive));
router.get('/',                                                                     asyncHandler(ctrl.listAnnouncements));
router.post('/',            authorize(['dept_admin','super_admin']), validate(createAnnouncementSchema), asyncHandler(ctrl.createAnnouncement));
router.get('/:id',                                                                  asyncHandler(ctrl.getAnnouncement));
router.patch('/:id',        authorize(['dept_admin','super_admin']), validate(updateAnnouncementSchema), asyncHandler(ctrl.updateAnnouncement));
router.delete('/:id',       authorize(['dept_admin','super_admin']),                asyncHandler(ctrl.deleteAnnouncement));
router.post('/:id/read',    authorize(['resident']),                                asyncHandler(ctrl.markRead));

module.exports = router;
