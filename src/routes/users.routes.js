const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/me',              asyncHandler(ctrl.getMe));
router.patch('/me',            asyncHandler(ctrl.updateMe));
router.patch('/me/password',   asyncHandler(ctrl.changePassword));
router.get('/staff',           authorize(['dept_admin','super_admin']), asyncHandler(ctrl.listDeptStaff));
router.get('/',                authorize(['super_admin']),              asyncHandler(ctrl.listUsers));
router.post('/staff',          authorize(['super_admin','dept_admin']), asyncHandler(ctrl.createStaff));
router.patch('/:id/status',    authorize(['super_admin']),              asyncHandler(ctrl.updateStatus));
router.patch('/:id/role',      authorize(['super_admin']),              asyncHandler(ctrl.updateRole));

module.exports = router;
