const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/wishlist.controller');

router.get('/', controller.wishlist);
router.post('/add', controller.addToWishlist);
router.delete('/delete', controller.removeFromWishlist);
router.post('/data', controller.getWishlistData);

module.exports = router;
