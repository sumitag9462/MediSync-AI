const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve avatar static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/doselogs', require('./routes/doseLogRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
