const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(mongoSanitize()); // Prevent NoSQL injection

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Serve avatar static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/doselogs', require('./routes/doseLogRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 requests per `window`
    message: 'Too many chat requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/chatbot', chatLimiter, require('./routes/chatbotRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/intelligence', require('./routes/intelligenceRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/push', require('./routes/pushRoutes'));
app.use('/api/adherence', require('./routes/adherenceRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/interactions', require('./routes/interactionRoutes'));

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MediSync-AI API',
            version: '2.0.0',
            description: 'Enterprise API Documentation for MediSync-AI Platform',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'MediSync-AI is running seamlessly!' }));

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const SocketService = require('./services/SocketService');
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Initialize Socket.io
SocketService.init(server);
