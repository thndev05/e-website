const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionID: {
        type: String,
    },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantSKU: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            subtotal: { type: Number, required: true },
        }
    ],
    shippingInfo: {
        name: String,
        phone: String,
        province: String,
        district: String,
        ward: String,
        street: String
    },
    paymentMethod: { type: String, enum: ['online_banking', 'cash_on_delivery'], required: true },
    subtotal: {type: Number, required: true},
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'delivering', 'completed', 'cancelled'],
        default: 'pending'
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: false
    },
    notes: {
        type: String,
        default: '',
        required: false,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
    if (!this.transactionID) {
        this.transactionID = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema, 'orders');
