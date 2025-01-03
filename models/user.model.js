const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const generate = require("../helpers/generate");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    token: {
        type: String,
        default: (function() {
            return generate.generateRandomString(20);
        }),
    },
    birthdate: Date,
    address: [
        {
            phone: String,
            province: String,
            district: String,
            ward: String,
            street: String
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: [],
        },
    ],
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema, 'users');
