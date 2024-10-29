const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Connect cloudinary
cloudinary.config({
  cloud_name: 'dlnpm0kdo',
  api_key: '258652766361362',
  api_secret: 'Wk_vFnGpZat8d7Y2DUSMcObBIOc'
});
// End cloudinary

module.exports.upload = async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    let streamUpload = (file) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    try {
      const uploadPromises = req.files.map(file => streamUpload(file));

      const results = await Promise.all(uploadPromises);

      req.body.files = results.map((result, index) => ({
        fieldName: req.files[index].fieldname,
        image: result.secure_url
      }));
      
      next();
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).send("Error uploading files");
    }
  } else {
    next();
  }
}