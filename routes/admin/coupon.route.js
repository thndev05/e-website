const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/coupon.controller');

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/create', controller.createPost);
router.delete('/delete/:id', controller.delete);
router.get('/edit/:id', controller.edit);
router.patch('/edit/:id', controller.editPatch);
router.patch('/change-status/:status/:id', controller.changeStatus);

module.exports = router;