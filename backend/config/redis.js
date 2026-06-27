const Redis = require('ioredis');
require('dotenv').config();

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);

redisConnection.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

redisConnection.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

module.exports = redisConnection;
