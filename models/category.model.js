const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    status: String,
    deleted: {
        type: Boolean,
        default: false
    },
    subcategories: {
        type: [String],
        default: [],
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);
