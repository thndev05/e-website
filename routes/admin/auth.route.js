const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/auth.controller');

router.get('/login', controller.login);


module.exports = router;