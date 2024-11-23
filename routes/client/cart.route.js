const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/cart.controller.js');

router.get('/', controller.index);
router.get('/detail', controller.cartDetail);
router.post('/add', controller.addToCart);
router.delete('/remove', controller.removeFromCart);
router.patch('/update', controller.updateCart);

module.exports = router;