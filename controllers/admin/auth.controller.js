const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');

const Account = require("../../models/account.model");


//[GET] /admin/auth/login
module.exports.login = async (req, res) => {
  if(req.cookies.token) {
    res.redirect(`${systemConfig.prefixAdmin}/`);
  } else {
    res.render('admin/auth/login', {
      pageTitle: 'LOGIN SYSTEM'
    });
  }
}

//[POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;


  const user = await Account.findOne({
    email: email,
    deleted: false
  });

  if(!user) {
    return res.redirect('back');
  }
  if(await bcrypt.compare(password, user.password) == false) {
    return res.redirect('back');
  }

  if(user.status !== 'active') {
    return res.redirect('back');
  }

  res.cookie('token', user.token);
  res.redirect(`${systemConfig.prefixAdmin}/`);
}

//[GET] /admin/auth/logout
module.exports.logout = async (req, res) => {
  res.clearCookie('token');

  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}