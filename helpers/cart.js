const Cart = require("../models/cart.model");

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

module.exports.getOrCreateCart = getOrCreateCart;