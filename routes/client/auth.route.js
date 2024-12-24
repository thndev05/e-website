const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/auth.controller');

router.get('/login', controller.login);
router.post('/login', controller.loginPost);

router.get('/register', controller.register);
router.post('/register', controller.registerPost);

router.get('/forgot-password', controller.forgotPassword);
router.post('/forgot-password', controller.forgotPasswordPost);

router.get('/reset-password/:code', controller.resetPassword);
router.post('/reset-password/:code', controller.resetPasswordPost);

router.get('/logout', controller.logout);


module.exports = router;
