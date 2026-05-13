const router = require('express').Router();
const ctrl = require('../controllers/audit.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize(['super_admin']));
router.get('/', asyncHandler(ctrl.listAuditLogs));

module.exports = router;
