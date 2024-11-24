const Cart = require('../../models/cart.model');
const Coupon = require('../../models/coupon.model');

module.exports.index = async (req, res, next) => {
    if (!res.locals.user) {
        const error = new Error('Not logged in');
        next(error);
        return;
    }

    const cart = await getOrCreateCart(res.locals.user.id);

    res.render('client/cart/index', {
        title: 'Cart',
        isHome: false,
        breadcrumbTitle: 'Shoping Cart',
        breadcrumb: 'Cart',
        cart: cart,
    });
}

module.exports.cartDetail = async function (req, res, next) {
    if (!res.locals.user) {
        const error = new Error('Not logged in');
        next(error);
        return;
    }

    const cart = await getOrCreateCart(res.locals.user.id);
    res.json(cart);
}

module.exports.addToCart = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const { productId, variantSKU, quantity } = req.body;

        const cart = await getOrCreateCart(userId);

        const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId && p.variantSKU === variantSKU);

        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, variantSKU, quantity });
        }

        await Cart.updateOne({_id: cart._id}, cart);

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports.updateCart = async (req, res) => {
    const { productId, variantSKU, quantity } = req.body;

    try {
        const userId = res.locals.user.id;
        const cart = await getOrCreateCart(userId);

        const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId && p.variantSKU === variantSKU);

        if (productIndex > -1) {
            cart.products[productIndex].quantity = quantity;

            if (quantity <= 0) {
                cart.products.splice(productIndex, 1);
            }
        } else {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        await Cart.updateOne({_id: cart._id}, cart);

        res.json(cart);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports.removeFromCart = async (req, res) => {
    const { productId, variantSKU } = req.body;

    try {
        const userId = res.locals.user.id;
        const cart = await getOrCreateCart(userId);

        cart.products = cart.products.filter(p => !(p.product._id.toString() === productId && p.variantSKU === variantSKU));

        await Cart.updateOne({_id: cart._id}, cart);
        res.json(cart);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports.applyCoupon = async (req, res) => {
    const { couponCode } = req.body;

    try {
        const userId = res.locals.user.id;
        const cart = await getOrCreateCart(userId);

        const coupon = await Coupon.findOne({ code: couponCode, deleted: false, isActive: true });
        if (!coupon) {
            res.status(404).json({message: 'Coupon not found.' });
            return;
        }

        if (new Date() > coupon.expirationDate) {
            res.status(400).json({message: "Coupon has expired."})
            return;
        }

        if (coupon.maxUses && coupon.timesUsed >= (coupon.maxUses || Infinity)) {
            res.status(403).json({message: "Coupon usage limit reached."})
            return
        }

        const userUsage = coupon.usageByUser.find(
            (usage) => usage.userId.toString() === userId.toString()
        );

        if (userUsage && userUsage.uses >= (coupon.maxUsesPerUser || Infinity)) {
            res.status(403).json({message: "You have reached the usage limit for this coupon."})
            return;
        }

        const { subtotal } = cart;
        const { discountType, discountValue } = coupon;

        const discount = Math.min(subtotal, discountType === 'percentage' ? subtotal * discountValue / 100 : discountValue);

        res.status(200).json({success: true, subtotal, discount, total: subtotal - discount});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('products.product').lean();

    if (!cart) {
        cart = await Cart.create({ user: userId, products: [] });
    }

    cart.products = cart.products
        .map(p => {
            const variant = p.product?.variants?.find(v => v.sku === p.variantSKU);
            if (variant) {
                return { ...p, variant };
            }
            return null;
        })
        .filter(Boolean);

    cart.subtotal = cart.products.reduce((n, {quantity, variant}) => n + quantity * (variant.salePrice ? variant.salePrice : variant.price), 0);

    return cart;
}