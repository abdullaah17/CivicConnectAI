const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize(['dept_admin','super_admin']));

router.get('/tickets/summary',  asyncHandler(ctrl.ticketSummary));
router.get('/tickets',          asyncHandler(ctrl.ticketSummary));
router.get('/permits',          asyncHandler(ctrl.permitSummary));
router.get('/sla',              asyncHandler(ctrl.slaSummary));
router.get('/top-issues',       asyncHandler(ctrl.topIssues));
router.get('/heatmap',          asyncHandler(ctrl.heatmap));
router.get('/export-csv',       asyncHandler(ctrl.exportCsvHandler));
router.get('/export-pdf',       asyncHandler(ctrl.exportPdfHandler));

module.exports = router;
