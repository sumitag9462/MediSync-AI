const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Serve uploaded avatars
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/doselogs', require('./routes/doseLogRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));


// ✅ Mock payment route (works without Razorpay)
app.post('/api/payment/create-order', (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum amount is ₹100' });
  }

  // Simulate successful backend order creation
  const fakeOrder = {
    id: 'order_' + Math.random().toString(36).substring(2, 10),
    amount,
    currency: 'INR',
    status: 'created',
  };

  console.log('✅ Payment order created:', fakeOrder);
  res.status(200).json({ success: true, order: fakeOrder });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
