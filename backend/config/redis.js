const Redis = require('ioredis');
require('dotenv').config();

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        if (times > 3) {
            console.warn('⚠️ Redis unreachable, stopping retries.');
            return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 50, 2000);
    }
};

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);

redisConnection.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

module.exports = redisConnection;
