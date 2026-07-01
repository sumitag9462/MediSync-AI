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

// Comprehensive production validation
const requiredKeys = [
    'MONGO_URI', 
    'JWT_SECRET', 
    'REDIS_URL',
    'EMAIL_USER',
    'EMAIL_PASS',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'GEMINI_API_KEY',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY'
];

const missingKeys = [];

for (const key of requiredKeys) {
    if (!process.env[key]) {
        missingKeys.push(key);
    }
}

if (missingKeys.length > 0) {
    console.error(`[FATAL ERROR] Missing required environment variables: ${missingKeys.join(', ')}`);
    console.error(`Please provide these variables in your .env file or deployment environment.`);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Fail fast in production
    } else {
        console.warn(`[WARNING] Backend may not function correctly in development without these variables.`);
    }
}

module.exports = env;
