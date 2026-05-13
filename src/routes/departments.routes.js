const router = require('express').Router();
const ctrl = require('../controllers/departments.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { slaConfigSchema } = require('../schemas/slaConfig.schema');

router.use(authenticate);

router.get('/',           asyncHandler(ctrl.listDepartments));
router.get('/:id',        asyncHandler(ctrl.getDepartment));
router.patch('/:id',      authorize(['super_admin']), asyncHandler(ctrl.updateDepartment));
router.get('/:id/staff',  authorize(['dept_admin','super_admin']), asyncHandler(ctrl.getDeptStaff));

module.exports = router;
