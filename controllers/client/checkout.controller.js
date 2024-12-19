const Cart = require('../../models/cart.model');
const Coupon = require('../../models/coupon.model');

module.exports.index = async (req, res, next) => {
    if (!res.locals.user) {
        const error = new Error('Not logged in');
        next(error);
        return;
    }

    // const cart = await getOrCreateCart(res.locals.user.id);

    res.render('client/checkout/index', {
        title: 'Checkout',
        isHome: false,
        breadcrumbTitle: 'Checkout',
        breadcrumb: 'Checkout',
        // cart: cart,
    });
}