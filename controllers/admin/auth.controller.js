const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');

const Account = require("../../models/account.model");


//[GET] /admin/auth/login
module.exports.login = async (req, res, next) => {
  try {
    if(req.cookies.token) {
      res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    } else {
      res.render('admin/auth/login', {
        pageTitle: 'LOGIN SYSTEM'
      });
    }
  } catch (error) {
    console.error(error);
    res.redirectPage = '/admin/auth/login';
    next(error);
  }
}

//[POST] /admin/auth/login
module.exports.loginPost = async (req, res, next) => {
  const {email, password} = req.body;

  try {
    if (!email ) {
      throw new Error("Email is empty.")
    }

    if (!password) {
      throw new Error("Password is empty.");
    }

    const user = await Account.findOne({
      email: email,
      deleted: false
    });

    if(!user) {
      throw new Error("No matching account was found.");
    }

    if(await bcrypt.compare(password, user.password) == false) {
      throw new Error("Incorrect password. Please try again.");
    }

    if(user.status !== 'active') {
      throw new Error("No matching account was found.");
    }

    res.cookie('token', user.token);
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  } catch (error) {
    console.error(error);
    res.render('admin/auth/login', {
      pageTitle: 'LOGIN SYSTEM',
      email,
      password,
      sweetAlert: {
        icon: 'error',
        title: 'Oops...',
        text: error.message,
        confirmButtonText: 'OK',
      }
    });
  }
}

//[GET] /admin/auth/logout
module.exports.logout = async (req, res) => {
  res.clearCookie('token');

  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}