require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novatech', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✓ Kết nối MongoDB thành công');
})
.catch(err => {
  console.error('✗ Lỗi kết nối MongoDB:', err);
});

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route không tìm thấy' });
});

app.use((err, req, res, next) => {
  console.error('Lỗi:', err);
  res.status(500).json({ success: false, message: 'Lỗi server' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend đang chạy tại http://localhost:${PORT}`);
});
