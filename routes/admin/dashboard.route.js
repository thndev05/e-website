const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/dashboard.controller');

router.get('/', controller.dashboard);
router.get('/analyticsData', controller.analyticsData);

module.exports = router;
