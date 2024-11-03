const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  permissions: {
    type: Array,
    default: []
  },
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema, 'roles');
