const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const productHelper = require('../helpers/product');

mongoose.plugin(slug);

const variantSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    costPrice: { type: Number, required: true },
    price: { type: Number, required: true},
    salePrice: { type: Number },
    stock: { type: Number, default: 0 },
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
    shortDescription: String,
    brand: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: String,
    gender: { type: String, enum: ['male', 'female', 'unisex'] },
    images: [{ type: String }],
    tags: [String],
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
