const express = require('express');
const router = express.Router();
const { 
  submitBatch, 
  getCompanyBatches, 
  getAllBatches, 
  updateBatchStatus 
} = require('../controllers/companyController');
const authMiddleware = require('../utils/authMiddleware');

// Company routes
router.post('/batch', authMiddleware, submitBatch);
router.get('/batches', authMiddleware, getCompanyBatches);

// Admin routes
router.get('/admin/batches', authMiddleware, getAllBatches);
router.put('/admin/batch/:batchId/status', authMiddleware, updateBatchStatus);

module.exports = router;