const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantSKU: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
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
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema, 'orders');
