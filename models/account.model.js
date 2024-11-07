const mongoose = require('mongoose');
const generate = require('../helpers/generate');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true },
  token: {
    type: String,
    default: (function() {
      return generate.generateRandomString(20);
    }),
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  avatar: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema, 'accounts');
