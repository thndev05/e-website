const Cart = require('../../models/cart.model');
const Coupon = require('../../models/coupon.model');
const CartHelper = require('../../helpers/cart')

module.exports.index = async (req, res, next) => {
    if (!res.locals.user) {
        const error = new Error('Not logged in');
        next(error);
        return;
    }

    const { couponCode } = req.query;

    const cart = await CartHelper.getOrCreateCart(res.locals.user.id);

    res.render('client/checkout/index', {
        title: 'Checkout',
        isHome: false,
        breadcrumbTitle: 'Checkout',
        breadcrumb: 'Checkout',
        cart: cart,
    });
}