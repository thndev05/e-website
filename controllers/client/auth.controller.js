const User = require('../../models/user.model');

const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');

//[GET] /auth/login
module.exports.login = async (req, res, next) => {
    try {
        if (req.query.returnTo) {
            req.session.returnTo = req.query.returnTo;
        }

        if (req.cookies.authToken) {
            res.redirect('/user/profile');
        } else {
            res.render('client/auth/login', {
                pageTitle: 'Login',
                breadcrumbTitle: 'Login',
                breadcrumb: 'Login'
            });
        }
    } catch (error) {
        console.error(error);
        res.redirectPage = 'back';
        next(error);
    }
}

//[GET] /auth/register
module.exports.register = async (req, res) => {
    if(req.cookies.authToken) {
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
module.exports.registerPost = async (req, res, next) => {
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

        res.cookie('authToken', newUser.token);

        const redirectTo = req.session.returnTo || '/';
        delete req.session.returnTo;

        res.redirect(redirectTo);
    } catch (e) {
        console.error(e);
        res.redirectPage = 'back';
        next(e);
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

        res.cookie('authToken', user.token);

        const redirectTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(redirectTo);

    } catch (error) {
        console.error(error);
        res.render('client/auth/login', {
            pageTitle: 'Login',
            breadcrumbTitle: 'Login',
            breadcrumb: 'Login'
        });
    }
};

module.exports.logout = (req, res, next) => {
    try {
        req.session.destroy();
        res.clearCookie('authToken');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.redirectPage = '/auth/login';
        next(error);
    }
};