const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/account.controller');

const multer = require('multer');
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const upload = multer({
  fileFilter: function (req, file, cb) {
    cb(null, true);
  }
}).any();

router.get('/', controller.index);

router.patch('/change-status/:status/:id', controller.changeStatus);

router.delete('/delete/:id', controller.delete);

router.get('/create', controller.create);
router.post('/create',
  upload,
  uploadCloud.upload,
  controller.createPost
);

router.get('/edit/:id', controller.edit);
router.patch('/edit/:id',
  upload,
  uploadCloud.upload,
  controller.editPatch
);


module.exports = router;
