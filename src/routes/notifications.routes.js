const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/unread-count',   asyncHandler(ctrl.unreadCount));
router.get('/',               asyncHandler(ctrl.listNotifications));
router.patch('/read-all',     asyncHandler(ctrl.markAllRead));
router.patch('/:id/read',     asyncHandler(ctrl.markRead));

module.exports = router;
