const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/product.controller');

router.get('/', controller.index);

router.get('/create', controller.create);


module.exports = router;
