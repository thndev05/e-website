const User = require('../../models/user.model');
const Order = require('../../models/order.model');
const Product = require('../../models/product.model');
const Coupon = require('../../models/coupon.model');

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
module.exports.updateProfile = async (req, res, next) => {
    try {
        const id = req.params.id;
        const {fullName, birthdate} = req.body;

        if (!fullName || fullName.length < 0) {
            throw new Error("Full name is empty!");
        }

        const selectedDate = new Date(birthdate);
        const currentYear = new Date().getFullYear();
        if (selectedDate.getFullYear() >= currentYear) {
            throw Error("The birthdate year cannot be greater than or equals the current year.");
        }

        await User.updateOne({ _id: id }, req.body);

        await updateSessionUser(req, id);

        res.redirect('back');
    } catch (e) {
        console.error(e);
        res.redirectPage = "back";
        next(e);
    }
};

//[PATCH] /user/changePassword/:id
module.exports.changePassword = async (req, res, next) => {
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
        console.error(e);
        res.redirectPage = "back";
        next(e);
    }
}

//[PATCH] /user/updateAddress/:id
module.exports.updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {phone, province, district, ward, street} = req.body;

        const phoneRegex = /^(0|\+84)(3[2-9]|5[2-9]|7[0|6-9]|8[1-9]|9[0-9])\d{7}$/;
        if (!phone || !phoneRegex.test(phone)) {
            throw new Error("Invalid phone number");
        }

        if (!province) {
            throw new Error("No province selected.");
        }

        if (!district) {
            throw new Error("No district selected.");
        }

        if (!ward) {
            throw new Error("No ward selected.");
        }

        if (!street || street.length === 0) {
            throw new Error("Street is empty");
        }

        await User.updateOne({ _id: id }, { $push: { address: {phone, province, district, ward, street} } });
        await updateSessionUser(req, id);
        res.redirect('back');
    } catch (e) {
        console.error(e);
        res.redirectPage = "back";
        next(e);
    }
};

//[DELETE] /deleteAddress/:id/:index
module.exports.deleteAddress = async (req, res, next) => {
    try {
        const { id, index } = req.params;
        await User.updateOne({ _id: id }, { $unset: { [`address.${index}`]: 1 } });
        await User.updateOne({ _id: id }, { $pull: { address: null } });
        await updateSessionUser(req, id);

        res.redirect('back');
    } catch (e) {
        console.error(e);
        res.redirectPage = "back";
        next(e);
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
module.exports.cancelOrder = async (req, res, next) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });

        await revertCouponUsage(order, res.locals.user.id);
        await restoreProductStock(order);

        if (order) {
            return res.json({ success: true, message: 'Order has been cancelled successfully!' });
        } else {
            return res.json({ success: false, message: 'Order not found or cannot be cancelled!' });
        }
    } catch (error) {
        console.error(error);
        res.redirectPage = "back";
        next(error);
    }
};

async function revertCouponUsage(order, userId) {
    if (!order?.coupon) return;

    const coupon = await Coupon.findById(order.coupon);
    if (!coupon) return;

    coupon.timesUsed = Math.max(0, coupon.timesUsed - 1);

    const userUsage = coupon.usageByUser.find(usage => usage.userId.toString() === userId);
    if (userUsage && userUsage.uses > 0) {
        userUsage.uses--;
    }

    await coupon.save();
}

async function restoreProductStock(order) {
    if (!order?.products?.length) return;

    for (const p of order.products) {
        const product = await Product.findById(p.product);
        if (!product) continue;

        const variant = product.variants.find(v => v.sku === p.variantSKU);
        if (!variant) continue;

        variant.stock += p.quantity;
        await product.save();
    }
}

