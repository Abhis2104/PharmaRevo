require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const bcrypt = require('bcrypt');

(async ()=>{
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/pharmarevo');
  await User.deleteMany({});
  await Medicine.deleteMany({});
  const passwordHash = await bcrypt.hash('password123',10);
  const u = await User.create({ name: 'Test Donor', email: 'donor@example.com', passwordHash, role: 'donor' });
  await Medicine.create({ name: 'Paracetamol', brand: 'Acme', expiryDate: new Date('2026-05-01'), quantity: 10, donatedBy: u._id, status: 'verified' });
  console.log('Seed complete');
  process.exit(0);
})();
