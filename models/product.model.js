const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const variantSchema = new mongoose.Schema({
    name: { type: String },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, required: true },
    image: { type: String },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: String,
    // category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    thumbnail: String,
    status: String,
    deleted: {
        type: Boolean,
        default: false,
    },
    variants: [variantSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema, 'products');
