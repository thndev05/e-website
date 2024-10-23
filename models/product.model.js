const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const productHelper = require('../helpers/product');

mongoose.plugin(slug);

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number },
    quantity: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    image: { type: String },
});

variantSchema.pre('save', function (next) {
    if (!this.sku) {
        this.sku = productHelper.generateSKU(this.name, this.color, this.size);
    }
    next();
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
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
