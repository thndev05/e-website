const User = require('../../models/user.model');

const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');

//[GET] /auth/login
module.exports.login = async (req, res) => {
    if(req.session.user) {
      res.redirect('/user/profile');
    } else {
        res.render('client/auth/login', {
          pageTitle: 'Login',
          breadcrumbTitle: 'Login',
          breadcrumb: 'Login'
        });
    }
}

//[GET] /auth/register
module.exports.register = async (req, res) => {
    if(req.session.user) {
       res.redirect('/user/profile');
    } else {
        res.render('client/auth/register', {
            pageTitle: 'Register',
            breadcrumbTitle: 'Register',
            breadcrumb: 'Register'
        })
    }
}

//[POST] /auth/register
module.exports.registerPost = async (req, res) => {
    try {
        const { fullName, birthdate, email, password } = req.body;
        const data = { fullName, birthdate, email, password };

        const user = await User.findOne({ email });
        if(user) {
            return res.render('client/auth/register', {
              pageTitle: 'Register',
              breadcrumbTitle: 'Register',
              breadcrumb: 'Register',
              error: 'Email already exist. Please try another email!'
            });
        }

        if(password.length < 8) {
            return res.render('client/auth/register', {
              pageTitle: 'Register',
              breadcrumbTitle: 'Register',
              breadcrumb: 'Register',
              error: 'Please enter a password of at least 8 characters!'
            });
        }

        const newUser = new User(data);
        await newUser.save();

        res.redirect('/auth/login');
    } catch (e) {
        console.log(e);
    }
}

//[POST] /auth/login
module.exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('client/auth/login', {
                pageTitle: 'Login',
                breadcrumbTitle: 'Login',
                breadcrumb: 'Login',
                error: 'Email is not exist. Please try again.'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.render('client/auth/login', {
                pageTitle: 'Login',
                breadcrumbTitle: 'Login',
                breadcrumb: 'Login',
                error: 'Password is incorrect. Please try again.'
            });
        }

        req.session.user = {
            id: user._id,
            birthdate: user.birthdate,
            fullName: user.fullName,
            email: user.email,
            address: user.address
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('client/auth/login', {
            pageTitle: 'Login',
            breadcrumbTitle: 'Login',
            breadcrumb: 'Login'
        });
    }
};

module.exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};