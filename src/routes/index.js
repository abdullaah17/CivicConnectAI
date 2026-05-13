const router = require('express').Router();

router.use('/auth',          require('./auth.routes'));
router.use('/users',         require('./users.routes'));
router.use('/tickets',       require('./tickets.routes'));
router.use('/permits',       require('./permits.routes'));
router.use('/announcements', require('./announcements.routes'));
router.use('/events',        require('./events.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/analytics',     require('./analytics.routes'));
router.use('/departments',   require('./departments.routes'));
router.use('/audit',         require('./audit.routes'));

module.exports = router;
