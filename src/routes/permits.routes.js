const router = require('express').Router();
const ctrl = require('../controllers/permits.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createPermitSchema, updateDraftSchema, permitStatusSchema } = require('../schemas/permit.schema');

// Public route — no auth
router.get('/verify/:permitNumber', asyncHandler(ctrl.verifyPermit));

router.use(authenticate);

router.get('/types',              asyncHandler(ctrl.getTypes));
router.get('/',                   asyncHandler(ctrl.listPermits));
router.post('/',                  authorize(['resident']), validate(createPermitSchema), asyncHandler(ctrl.createPermit));
router.get('/:id',                asyncHandler(ctrl.getPermit));
router.patch('/:id/draft',        authorize(['resident']), validate(updateDraftSchema),  asyncHandler(ctrl.saveDraft));
router.post('/:id/submit',        authorize(['resident']),                               asyncHandler(ctrl.submitPermit));
router.patch('/:id/status',       authorize(['dept_admin','super_admin']), validate(permitStatusSchema), asyncHandler(ctrl.updateStatus));
router.post('/:id/documents',     authorize(['resident']), upload.single('file'),        asyncHandler(ctrl.uploadDocument));
router.get('/:id/certificate',    authorize(['resident','dept_admin']),                  asyncHandler(ctrl.getCertificate));
router.get('/:id/receipt',        authorize(['resident']),                               asyncHandler(ctrl.getReceipt));

module.exports = router;
