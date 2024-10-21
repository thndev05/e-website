const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/category.controller');

router.get('/', controller.index);

router.get('/create', controller.create);

router.post('/store', controller.store);
//
// router.delete('/delete/:id', controller.delete);


module.exports = router;
