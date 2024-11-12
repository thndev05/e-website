const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/user.controller');

router.get('/profile', controller.profile);

router.patch('/updateProfile/:id', controller.updateProfile);

router.patch('/changePassword/:id', controller.changePassword);

router.patch('/updateAddress/:id', controller.updateAddress);
router.delete('/deleteAddress/:id/:index', controller.deleteAddress);


module.exports = router;
