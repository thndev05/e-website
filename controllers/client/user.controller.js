const User = require('../../models/user.model');
const bcrypt = require('bcrypt');

//[GET] /user/profile
module.exports.profile = async (req, res) => {
    if(!req.session.user) {
       res.redirect('/auth/login');
    } else {
        res.render('client/user/profile', {
          pageTitle: 'Profile',
          breadcrumbTitle: 'Profile',
          breadcrumb: 'Profile'
        })
    }
}

//[PATCH] /user/updateProfile/:id
module.exports.updateProfile = async (req, res) => {
    try {
        const id = req.params.id;
        await User.updateOne({ _id: id }, req.body);
        req.session.user = req.body;
        res.redirect('back');
    } catch (e) {
        console.log(e);
        res.render('client/user/profile', {
          pageTitle: 'Profile',
          breadcrumbTitle: 'Profile',
          breadcrumb: 'Profile'
        });
    }
}

//[PATCH] /user/changePassword/:id
module.exports.changePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        const userData = await User.findById(id);

        if(await bcrypt.compare(currentPassword, userData.password) == false) {
            return res.render('client/user/profile', {
                pageTitle: 'Profile',
                breadcrumbTitle: 'Profile',
                breadcrumb: 'Profile',
                error: 'Your password doesn\'t match current password!'
            });
        }

        if(newPassword === currentPassword) {
            return res.render('client/user/profile', {
                pageTitle: 'Profile',
                breadcrumbTitle: 'Profile',
                breadcrumb: 'Profile',
                error: 'Please enter new password doesn\'t match current password!'
            });
        }

        if(newPassword.length < 8) {
            return res.render('client/user/profile', {
                pageTitle: 'Profile',
                breadcrumbTitle: 'Profile',
                breadcrumb: 'Profile',
                error: 'Please enter a password of at least 8 characters!'
            });
        }

        if(newPassword !== confirmNewPassword) {
            return res.render('client/user/profile', {
                pageTitle: 'Profile',
                breadcrumbTitle: 'Profile',
                breadcrumb: 'Profile',
                error: 'Your confirmed password doesn\'t match!'
            });
        }

        const changedPassword = await bcrypt.hash(newPassword, 12);
        await User.updateOne({ _id: id }, { password: changedPassword });
        res.redirect('back');

    } catch (e) {
        console.log(e);
        res.render('client/user/profile', {
            pageTitle: 'Profile',
            breadcrumbTitle: 'Profile',
            breadcrumb: 'Profile'
        });
    }
}