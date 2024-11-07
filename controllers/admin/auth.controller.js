const systemConfig = require("../../config/system");

//[GET] /admin/auth/login
module.exports.login = async (req, res) => {
  res.render('admin/auth/login', {
    pageTitle: 'Login system'
  });
}