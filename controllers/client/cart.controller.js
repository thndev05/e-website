const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const User = require("../../models/user.model");

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

    return cart;
}
