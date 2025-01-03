const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/checkout.controller');

router.get('/', controller.index);
router.post('/process', controller.process);

router.get('/qr', controller.getQR);

module.exports = router;