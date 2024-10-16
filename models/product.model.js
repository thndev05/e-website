const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, required: true },
    image: { type: String },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    variants: [variantSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
