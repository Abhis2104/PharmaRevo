require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const medRoutes = require('./routes/medicines');
const companyRoutes = require('./routes/company');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medRoutes);
app.use('/api/company', companyRoutes);

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/pharmarevo')
  .then(() => {
    app.listen(PORT, () => console.log('Server running on', PORT));
  })
  .catch(err => { console.error(err); process.exit(1); });
