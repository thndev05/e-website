const User = require('../../models/user.model');
const { prefixAdmin } = require("../../config/system");
const bcrypt = require('bcrypt');

// [GET] /admin/users
module.exports.index = async (req, res) => {
    const users = await User.find({}).lean();

    res.render('admin/users/index', {
        pageTitle: 'Users Management',
        currentPage: 'users',
        users: users,
    });
}

// [DELETE] /admin/users/delete/:id
module.exports.delete = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.redirect('back');
    } catch (e) {
        console.log(e);
    }
}

// [GET] /admin/users/delete/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id }).lean();

        if (user.birthdate) {
            const formattedDate = user.birthdate.toISOString().slice(0, 10);
            user.birthdate = formattedDate;
        }

        res.render('admin/users/edit', {
            pageTitle: 'Users Management',
            currentPage: 'users',
            updatedUser: user,
        });
    } catch (e) {
        console.log(e);
        res.redirect('back');
    }
}

// [PATCH] /admin/users/delete/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.body.password === '') {
            delete req.body.password;
        } else if (req.body.password.length < 8) {
            return res.render(`${prefixAdmin}/users/edit/${id}`, {
                error: 'Password must be at least 8 characters',
            });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            req.body.password = hashedPassword;
        }

        await User.updateOne({ _id: id }, req.body);
        res.redirect('back');
    } catch (e) {
        console.log(e);
    }
}

