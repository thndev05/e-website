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

    let cartSubTotal = 0;
    for (const cartItem of cart.products) {
        const variant = cartItem.variant;

        cartItem.effectivePrice = getEffectivePrice(variant);
        cartItem.variantDescription = getVariantDescription(variant);

        let price = Number(cartItem.effectivePrice) * Number(cartItem.quantity);
        cartItem.totalPrice = price;
        cartSubTotal += price;
    }
    cart.cartSubTotal = cartSubTotal;

    let discount = 0;
    let alert;
    try {
        discount = await getCouponDiscount(res.locals.user.id, cart, couponCode);
    } catch (error) {
        alert = error.message;
        console.error(error);
    }
    console.log(alert);

    res.render('client/checkout/index', {
        title: 'Checkout',
        isHome: false,
        breadcrumbTitle: 'Checkout',
        breadcrumb: 'Checkout',
        cart: cart,
        cartSubTotal: cartSubTotal,
        discount: discount,
        total: cartSubTotal - discount,
        couponCode: couponCode,
        alert: alert,
    });
}

function getEffectivePrice(variant) {
    return variant.salePrice || variant.price;
}

function getVariantDescription(variant) {
    return [variant.name, variant.color, variant.size]
        .filter(Boolean)
        .join(" ")
        .trim();
}

async function getCouponDiscount(userId, cart, couponCode) {
    if (!couponCode || couponCode.length === 0) {
        return 0;
    }

    const coupon = await Coupon.findOne({ code: couponCode, deleted: false, isActive: true });
    if (!coupon) {
        throw new Error('Coupon not found.');
    }

    if (new Date() > coupon.expirationDate) {
        throw new Error('Coupon expired.');
    }

    if (coupon.maxUses && coupon.timesUsed >= (coupon.maxUses || Infinity)) {
        throw new Error('Coupon usage limit reached.')
    }

    const userUsage = coupon.usageByUser.find(
        (usage) => usage.userId.toString() === userId.toString()
    );

    if (userUsage && userUsage.uses >= (coupon.maxUsesPerUser || Infinity)) {
        throw new Error('You have reached the usage limit for this coupon.')
    }

    const { cartSubTotal } = cart;
    const { discountType, discountValue } = coupon;

    return Math.min(cartSubTotal, discountType === 'percentage' ? cartSubTotal * discountValue / 100 : discountValue);
}
