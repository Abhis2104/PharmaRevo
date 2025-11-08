const Medicine = require('../models/Medicine');

exports.createMedicine = async (req, res) => {
  try {
    const payload = req.body;
    payload.donatedBy = req.user._id;
    if (req.files) payload.images = req.files.map(f => f.path);
    const med = await Medicine.create(payload);
    res.json(med);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listMedicines = async (req, res) => {
  const list = await Medicine.find().populate('donatedBy','name email');
  res.json(list);
};

exports.verifyMedicine = async (req, res) => {
  const { id } = req.params;
  const med = await Medicine.findByIdAndUpdate(id, { status: 'verified' }, { new: true });
  res.json(med);
};

exports.requestMedicine = async (req, res) => {
  const { id } = req.params;
  const med = await Medicine.findById(id);
  if (!med) return res.status(404).json({ message: 'Not found' });
  med.status = 'redistributed';
  await med.save();
  res.json({ message: 'Requested successfully' });
};
