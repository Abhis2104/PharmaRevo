const CompanyBatch = require('../models/CompanyBatch');
const Medicine = require('../models/Medicine');

// Submit company batch
const submitBatch = async (req, res) => {
  try {
    const {
      batchNumber,
      medicineName,
      expiryDate,
      manufacturingDate,
      quantity,
      reason,
      pickupAddress,
      city,
      pinCode,
      landmark
    } = req.body;

    const batch = new CompanyBatch({
      batchNumber,
      medicineName,
      expiryDate,
      manufacturingDate,
      quantity,
      reason,
      pickupAddress,
      city,
      pinCode,
      landmark,
      companyId: req.user.id
    });

    await batch.save();
    res.status(201).json({
      success: true,
      message: 'Batch submitted successfully',
      batch
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get company batches
const getCompanyBatches = async (req, res) => {
  try {
    const batches = await CompanyBatch.find({ companyId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all batches
const getAllBatches = async (req, res) => {
  try {
    const batches = await CompanyBatch.find()
      .populate('companyId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update batch status
const updateBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { status } = req.body;

    const batch = await CompanyBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    batch.status = status;
    if (status === 'Approved') {
      batch.approvedBy = req.user.id;
      batch.approvedAt = new Date();

      // Create medicine entry for approved batch
      const medicine = new Medicine({
        name: batch.medicineName,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
        description: `Company batch donation - ${batch.reason}`,
        pickupAddress: batch.pickupAddress,
        city: batch.city,
        pinCode: batch.pinCode,
        landmark: batch.landmark,
        donorId: batch.companyId,
        source: 'company',
        batchNumber: batch.batchNumber,
        status: 'Available'
      });

      await medicine.save();
    }

    await batch.save();

    res.json({
      success: true,
      message: `Batch ${status.toLowerCase()} successfully`,
      batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  submitBatch,
  getCompanyBatches,
  getAllBatches,
  updateBatchStatus
};