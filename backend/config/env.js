require('dotenv').config();

const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    EMAIL: {
        USER: process.env.EMAIL_USER,
        PASS: process.env.EMAIL_PASS
    },
    TWILIO: {
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
    },
    GOOGLE: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID
    }
};

// Simple validation
const requiredKeys = ['MONGO_URI', 'JWT_SECRET'];
for (const key of requiredKeys) {
    if (!env[key]) {
        console.warn(`[WARNING] Missing required environment variable: ${key}`);
    }
}

module.exports = env;
