const Coupon = require('../../models/coupon.model');
const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");

const { startSession } = require('mongoose');

const CartHelper = require('../../helpers/cart')

module.exports.index = async (req, res, next) => {
    try {
        if (!res.locals.user) {
            throw new Error('Not logged in');
        }
        const { couponCode } = req.query;

        const cart = await CartHelper.getOrCreateCart(res.locals.user.id);

        if (!Array.isArray(cart.products) || cart.products.length === 0) {
            throw new Error("Cart is empty");
        }

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
    } catch (error) {
        console.error(error);
        res.redirectPage = "/";
        next(error);
    }
}

module.exports.process = async (req, res, next) => {
    const {
        fullName, phone, province, district, ward, street,
        notes, couponCode, paymentMethod
    } = req.body;

    const userId = res.locals.user.id;

    try {
        const cart = await CartHelper.getOrCreateCart(userId);

        // Process cart items
        let cartSubTotal = 0;
        for (const cartItem of cart.products) {
            const variant = cartItem.variant;

            cartItem.unitPrice = getEffectivePrice(variant);
            cartItem.variantDescription = getVariantDescription(variant);

            const subtotal = Number(cartItem.unitPrice) * Number(cartItem.quantity);

            cartItem.subtotal = subtotal;

            cartSubTotal += subtotal;
        }

        // Handle coupon discount
        let discount = 0, coupon = null;
        discount = await getCouponDiscount(userId, cart, couponCode);
        if (discount > 0) {
            coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) throw new Error('Coupon not found.');
        }


        // Prepare order data
        const orderData = {
            userID: userId,
            products: cart.products,
            shippingInfo: { name: fullName, phone, province, district, ward, street },
            paymentMethod,
            subtotal: cartSubTotal,
            totalAmount: cartSubTotal - discount,
            coupon: coupon ? coupon._id : null,
            notes,
        };
        console.log(orderData.totalAmount);

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

            // Commit transaction and create order
            await session.commitTransaction();
            await session.endSession();

            if ('online_banking' === paymentMethod) {
                res.redirect('/checkout/qr?transactionID=' + order.transactionID);

                cancelOrderIfNotPaidAfterTimeout(order._id);
            } else {
                res.redirect('/user/purchase?status=all');
            }
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
            sweetAlert: {
                icon: 'error',
                title: 'Order Creation Failed',
                text: error.message,
                confirmButtonText: 'OK',
                redirectPage: "back"
            }
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

    const { subtotal } = cart;
    const { discountType, discountValue } = coupon;

    return Math.min(subtotal, discountType === 'percentage' ? subtotal * discountValue / 100 : discountValue);
}


module.exports.getQR = async (req, res, next) => {
    try {
        const {transactionID} = req.query;

        const order = await Order.findOne({transactionID: transactionID}).lean();
        if (!order) {
            throw new Error('Order not found!');
        }

        if (order.paymentMethod !== "online_banking") {
            throw new Error('Payment method must be "online_banking".');
        }

        if (order.isPaid === true) {
            throw new Error('Your order has already been paid.')
        }

        if (order.status !== 'pending') {
            throw new Error('Your order must be in "pending" state.');
        }

        const qrUrl = `https://img.vietqr.io/image/tpbank-khanh1402-compact2.jpg?amount=${order.totalAmount}&addInfo=${transactionID}&accountName=HUYNH%20QUOC%20KHANH`;


        res.render('client/checkout/qr', {
            title: 'QR Payment',
            isHome: false,
            breadcrumbTitle: 'QR Payment',
            breadcrumb: 'QR Payment',
            qrUrl,
        });
    } catch (error) {
        console.error(error);
        res.redirectPage = "/user/purchase?status=all";
        next(error);
    }
}

async function cancelOrderIfNotPaidAfterTimeout(orderId, timeout = 10 * 60 * 1000) {
    try {
        setTimeout(async () => {
            const order = await Order.findById(orderId);
            if (order && !order.isPaid && order.status === 'pending') {
                order.status = 'cancelled';
                await order.save();
                console.log(`Order ${orderId} has been cancelled due to non-payment.`);
            }
        }, timeout);
    } catch (error) {
        console.error(`Error cancelling order ${orderId}:`, error);
    }
}
