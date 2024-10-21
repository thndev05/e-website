const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/category.controller');

router.get('/', controller.index);

router.get('/create', controller.create);

router.post('/create', controller.createPost);

router.delete('/delete/:id', controller.delete);

router.patch('/change-status/:status/:id', controller.changeStatus);


module.exports = router;
