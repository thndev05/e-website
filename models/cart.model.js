const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantSKU: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
