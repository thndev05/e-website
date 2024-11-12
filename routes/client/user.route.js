const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/user.controller');

router.get('/profile', controller.profile);

router.patch('/updateProfile/:id', controller.updateProfile);

router.patch('/changePassword/:id', controller.changePassword);


module.exports = router;
