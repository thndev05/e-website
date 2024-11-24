const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minimumOrderValue: {
        type: Number,
        default: 0,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    maxUses: {
        type: Number,
        default: null,
    },
    maxUsesPerUser: {
        type: Number,
        default: null,
    },
    timesUsed: {
        type: Number,
        default: 0,
    },
    usageByUser: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            uses: {
                type: Number,
                default: 0,
            },
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

couponSchema.pre('save', function (next) {
    if (this.code) {
        this.code = this.code.toUpperCase();
    }

    this.updatedAt = Date.now();

    next();
});
module.exports = mongoose.model('Coupon', couponSchema);