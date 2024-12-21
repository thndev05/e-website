const Coupon = require('../../models/coupon.model');
const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");

const { startSession } = require('mongoose');

const CartHelper = require('../../helpers/cart')

module.exports.index = async (req, res, next) => {
    if (!res.locals.user) {
        const error = new Error('Not logged in');
        next(error);
        return;
    }

    const { couponCode } = req.query;

    const cart = await CartHelper.getOrCreateCart(res.locals.user.id);
    const user = await User.findOne({ _id: res.locals.user.id }).lean();

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

    res.render('client/checkout/index', {
        title: 'Checkout',
        isHome: false,
        breadcrumbTitle: 'Checkout',
        breadcrumb: 'Checkout',
        user: user,
        cart: cart,
        cartSubTotal: cartSubTotal,
        discount: discount,
        total: cartSubTotal - discount,
        couponCode: couponCode,
        alert: alert,
    });
}

module.exports.process = async (req, res) => {
    const {
        fullName, phone, province, district, ward, street,
        notes, couponCode, paymentMethod
    } = req.body;

    const userId = res.locals.user.id;

    try {
        // Fetch cart and user details
        const [cart, user] = await Promise.all([
            CartHelper.getOrCreateCart(userId),
            User.findById(userId).lean(),
        ]);

        // Process cart items
        let cartSubTotal = 0;
        for (const cartItem of cart.products) {
            const variant = cartItem.variant;

            cartItem.effectivePrice = getEffectivePrice(variant);
            cartItem.variantDescription = getVariantDescription(variant);

            const price = Number(cartItem.effectivePrice) * Number(cartItem.quantity);
            cartItem.price = price;
            cartSubTotal += price;
        }
        cart.cartSubTotal = cartSubTotal;

        // Handle coupon discount
        let discount = 0, coupon = null;
        try {
            discount = await getCouponDiscount(userId, cart, couponCode);
            if (discount > 0) {
                coupon = await Coupon.findOne({ code: couponCode });
                if (!coupon) throw new Error('Coupon not found.');
            }
        } catch (error) {
            console.error(error);
            return res.render('client/checkout/index', {
                title: 'Checkout',
                isHome: false,
                breadcrumbTitle: 'Checkout',
                breadcrumb: 'Checkout',
                alert: error.message,
            });
        }

        // Prepare order data
        const orderData = {
            userID: userId,
            products: cart.products,
            shippingInfo: { name: fullName, phone, province, district, ward, street },
            paymentMethod,
            totalAmount: cartSubTotal - discount,
            coupon: coupon ? coupon._id : null,
            notes,
        };

        // Start transaction
        const session = await startSession();
        session.startTransaction();

        try {
            // Update coupon usage if applicable
            if (coupon) {
                coupon.timesUsed++;
                const usageByUser = coupon.usageByUser.find(usage => usage.userId === userId);

                if (usageByUser) {
                    usageByUser.uses = (usageByUser.uses || 0) + 1;
                } else {
                    coupon.usageByUser.push({ userId, uses: 1 });
                }
                await Coupon.updateOne({ _id: coupon._id }, { $set: coupon }, { session });
            }

            // Update product stocks
            for (const cartItem of cart.products) {
                const product = await Product.findById(cartItem.product._id).session(session);
                const variant = product.variants.find(v => v.sku === cartItem.variantSKU);

                if (variant.stock < cartItem.quantity) {
                    throw new Error(`Product ${product.name} (${variant.sku}) out of stock.`);
                }

                variant.stock -= cartItem.quantity;
                await Product.updateOne(
                    { _id: product._id, 'variants.sku': variant.sku },
                    { $inc: { 'variants.$.stock': -cartItem.quantity } },
                    { session }
                );
            }

            // Clear cart
            cart.products = [];
            await Cart.updateOne({ _id: cart._id }, { $set: { products: [] } }, { session });

            const order = await Order.create(orderData);
            console.log(order);

            // Commit transaction and create order
            await session.commitTransaction();
            await session.endSession();

            res.redirect('/user/purchase?status=all');
        } catch (transactionError) {
            // Rollback transaction on error
            await session.abortTransaction();
            await session.endSession();
            throw transactionError;
        }
    } catch (error) {
        console.error(error);
        res.render('client/checkout/index', {
            title: 'Checkout',
            isHome: false,
            breadcrumbTitle: 'Checkout',
            breadcrumb: 'Checkout',
            alert: `Order creation failed!\nCause: ${error.message}`,
        });
    }
};

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

