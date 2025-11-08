const mongoose = require('mongoose');

const companyBatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    enum: ['surplus', 'return', 'near-expiry', 'damaged']
  },
  pickupAddress: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{6}$/
  },
  landmark: {
    type: String,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyBatch', companyBatchSchema);