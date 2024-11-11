const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');

//[GET] /auth/login
module.exports.login = async (req, res) => {
    res.render('client/auth/login', {
      pageTitle: 'Login',
      breadcrumbTitle: 'Login',
      breadcrumb: 'Login'
    })
}

//[GET] /auth/register
module.exports.register = async (req, res) => {
  res.render('client/auth/register', {
    pageTitle: 'Register',
    breadcrumbTitle: 'Register',
    breadcrumb: 'Register'
  })
}