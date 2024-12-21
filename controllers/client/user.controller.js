const User = require('../../models/user.model');
const Order = require('../../models/order.model');
const Product = require('../../models/product.model');

const bcrypt = require('bcrypt');
const updateSessionUser = require('../../helpers/session');
const {log} = require("debug");

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

        await updateSessionUser(req, id);

        res.redirect('back');
    } catch (e) {
        console.log(e);
        res.render('client/user/profile', {
            pageTitle: 'Profile',
            breadcrumbTitle: 'Profile',
            breadcrumb: 'Profile'
        });
    }
};

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
        res.redirect('/auth/logout');
    } catch (e) {
        console.log(e);
        res.redirect('back');
    }
}

//[PATCH] /user/updateAddress/:id
module.exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const newAddress = req.body;
        await User.updateOne({ _id: id }, { $push: { address: newAddress } });
        await updateSessionUser(req, id);
        res.redirect('back');
    } catch (e) {
        console.error(e);
        res.redirect('back');
    }
};

//[DELETE] /deleteAddress/:id/:index
module.exports.deleteAddress = async (req, res) => {
    try {
        const { id, index } = req.params;
        await User.updateOne({ _id: id }, { $unset: { [`address.${index}`]: 1 } });
        await User.updateOne({ _id: id }, { $pull: { address: null } });
        await updateSessionUser(req, id);

        res.redirect('back');
    } catch (e) {
        console.error(e);
        res.redirect('back');
    }
};

//[GET] /user/purchase
module.exports.purchase = async (req, res) => {
    const userID = res.locals.user.id;
    const status = req.query.status || 'all';

    let filter = {
        userID: userID
    };

    if (status !== 'all') {
        filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: "desc" }).lean();
    for (const order of orders) {
        for (const p of order.products) {
            const findProduct = await Product.findById(p.product).lean();
            p.name = findProduct.name;
        }
    }


    res.render('client/user/purchase', {
        pageTitle: 'Purchase history',
        breadcrumbTitle: 'Purchase',
        breadcrumb: 'Purchase',
        orders: orders,
        selectedStatus: status
    });
}

//[PATCH] /user/purchase/cancel/:orderId
module.exports.cancelOrder = async (req, res) => {
    const { orderId } = req.body; // Lấy orderId từ req.body
    console.log('Order ID:', orderId);

    try {
        const result = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });

        if (result) {
            return res.json({ success: true, message: 'Order has been cancelled successfully!' });
        } else {
            return res.json({ success: false, message: 'Order not found or cannot be cancelled!' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while cancelling the order!' });
    }
};

