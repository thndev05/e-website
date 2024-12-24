const nodemailer =  require('nodemailer');

const User = require('../../models/user.model');

const systemConfig = require("../../config/system");
const bcrypt = require('bcrypt');
const FormError = require("../../error/FormError");
const generate = require('../../helpers/generate');

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

const resetPasswordMap = new Map();

module.exports.forgotPassword = async (req, res, next) => {
    if(req.cookies.authToken) {
        res.redirect('/user/profile');
    } else {
        res.render('client/auth/forgotPassword', {
            pageTitle: 'Reset Password',
            breadcrumbTitle: 'Reset Password',
            breadcrumb: 'Reset Password'
        });
    }
}

module.exports.forgotPasswordPost = async (req, res, next) => {
    try {
        const {email} = req.body;

        if (!email) {
            throw new FormError('Email is empty');
        }

        const user = await User.findOne({email: email});
        if (!user) {
            res.render('client/auth/forgotPassword', {
                pageTitle: 'Reset Password',
                breadcrumbTitle: 'Reset Password',
                breadcrumb: 'Reset Password',
                email: email,
                error: 'No account was found with the entered email address.'
            });
            return;
        }

        const code = generate.generateRandomString(32);
        resetPasswordMap.set(code, user._id);

        await sendResetPasswordEmail(email, code, user);

        res.render('client/auth/sentEmail', {
            pageTitle: 'Reset Password',
            breadcrumbTitle: 'Reset Password',
            breadcrumb: 'Reset Password',
            email: email,
        });
    } catch (error) {
        console.error(error);
        res.redirectPage = 'back';
        next(error);
    }

}

module.exports.resetPassword = async (req, res, next) => {
    try {
        const code = req.params.code;
        if (!code) {
            throw new FormError('Invalid reset password code');
        }

        const userId = resetPasswordMap.get(code);
        if (!userId) {
            throw new FormError('Reset password code does not exist.');
        }

        res.render('client/auth/resetPassword', {
            pageTitle: 'Reset Password',
            breadcrumbTitle: 'Reset Password',
            breadcrumb: 'Reset Password',
            code: code,
        });

    } catch (error) {
        console.error(error);
        res.redirectPage = '/auth/forgot-password';
        next(error);
    }
}

module.exports.resetPasswordPost = async (req, res, next) => {
    try {
        const code = req.params.code;

        const {password, confirmPassword} = req.body;

        if (!code) {
            throw new FormError('Invalid reset password code');
        }

        const userId = resetPasswordMap.get(code);
        if (!userId) {
            throw new FormError('Reset password code does not exist.');
        }

        if (password.length < 8) {
            throw new FormError('Password must be at least 8 characters long.');
        }

        if (password !== confirmPassword) {
            throw new FormError('Passwords do not match.');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new FormError('User does not exist.');
        }

        user.password = password;

        await user.save();

        res.render('client/auth/resetPassword', {
            pageTitle: 'Reset Password',
            breadcrumbTitle: 'Reset Password',
            breadcrumb: 'Reset Password',
            sweetAlert: {
                icon: 'success',
                title: 'Password Changed!',
                text: 'Your password has been successfully updated.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                redirectPage: '/auth/login'
            }
        });

    } catch (error) {
        console.error(error);
        res.redirectPage = 'back';
        next(error);
    }
}

async function sendResetPasswordEmail(email, code, user) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const content = `
        <html lang="en">
            <head>
                <title>Password Reset Request - AuraStore</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f7f7f7;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .header img {
                        width: 150px;
                        margin-bottom: 15px;
                    }
                    .content {
                        font-size: 16px;
                        line-height: 1.5;
                        margin-bottom: 20px;
                    }
                    .content a {
                        color: #ff5722;
                        text-decoration: none;
                    }
                    .footer {
                        font-size: 14px;
                        text-align: center;
                        color: #777;
                    }
                    .footer a {
                        color: #777;
                        text-decoration: none;
                    }
                    a.btn {
                      color: #fff;
                    }
                    .btn {
                        background-color: #ff5722;
                        color: #fff;
                        padding: 10px 20px;
                        border-radius: 5px;
                        text-decoration: none;
                        display: inline-block;
                        margin-top: 15px;
                    }
                    .btn:hover {
                        background-color: #e64a19;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://i.ibb.co/t4ZWQ5z/logo.png" alt="aura-store-logo" border="0" />
                        <h2>Password Reset Request</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${user.fullName},</p>
                        <p>We have received a request to reset the password for your AuraStore account.</p>
                        <p>Click the button below to set a new password for your account:</p>
                        <a href="http://localhost:3000/auth/reset-password/${code}" class="btn">Reset Password</a>
                        <p>Or, you can copy and paste the following link into your browser:</p>
                        <p><a href="http://localhost:3000/auth/reset-password/${code}">http://localhost/auth/reset-password/${code}</a></p>
                        <p>If you did not request a password reset, please contact our Customer Support Team <a href="https://www.aurastore.com/contact">here</a>.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>AuraStore Team</p>
                        <p>If you have any questions, feel free to <a href="http://localhost:3000/contact">contact us here</a>.</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const mainOptions = {
        from: `AuraStore <no-reply@aurastore.com>`,
        to: email,
        subject: 'Password Reset Request for Your AuraStore Account',
        text: '',
        html: content
    }

    await transporter.sendMail(mainOptions);
}