const express = require('express');
const router = express.Router();
const auth = require('../utils/authMiddleware');
const { createMedicine, listMedicines, verifyMedicine, requestMedicine } = require('../controllers/medicineController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', listMedicines);
router.post('/', auth, upload.array('images', 4), createMedicine);
router.put('/:id/verify', auth, verifyMedicine);
router.post('/:id/request', auth, requestMedicine);

module.exports = router;
