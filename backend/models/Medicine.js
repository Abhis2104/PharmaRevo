const mongoose = require('mongoose');
const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  batchNumber: String,
  expiryDate: Date,
  quantity: { type: Number, default: 1 },
  unit: String,
  description: String,
  pickupAddress: String,
  city: String,
  pinCode: String,
  landmark: String,
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Keep for backward compatibility
  source: { type: String, enum: ['individual', 'pharmacy', 'company'], default: 'individual' },
  status: { type: String, enum: ['Pending','Approved','Rejected','Available','Redistributed','Expired','Disposed'], default: 'Pending' },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Medicine', medicineSchema);
