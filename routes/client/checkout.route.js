const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/client/auth.middleware');
const controller = require('../../controllers/client/checkout.controller');

router.get('/', authMiddleware.requireAuth, controller.index);
router.post('/process', authMiddleware.requireAuth, controller.process);

router.get('/qr',authMiddleware.requireAuth, controller.getQR);

// API to check payment status
router.get('/api/status/:transactionID',authMiddleware.requireAuth, controller.checkPaymentStatus);

router.post('/webhook/sepay', controller.sepayWebhook);

module.exports = router;