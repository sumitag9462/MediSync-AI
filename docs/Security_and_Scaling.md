# MediSync-AI Security & Scaling Strategy

## 1. Security Review & Protections
The following security mechanisms are fully implemented in the current repository:

- **Password Hashing**: `bcrypt.js` is used to hash all user passwords with a salt factor of 10 prior to DB insertion.
- **Stateless Authentication**: JWTs (JSON Web Tokens) are used for auth. 
- **Token Invalidation**: A `TokenBlocklist` MongoDB collection ensures that upon logout, the specific JWT is blacklisted and cannot be re-used, mitigating the inherent non-revocable nature of stateless JWTs.
- **Input Validation**: Mongoose schema types strictly enforce required fields, string lengths, and data types, rejecting malformed payloads before they hit business logic.
- **CORS Protection**: The Express server implements CORS restrictions, configured via the `FRONTEND_URL` environment variable to block unauthorized cross-origin requests.
- **Secrets Management**: All sensitive keys (MongoDB URI, Gemini API Key, Twilio Auth, JWT Secrets) are strictly isolated in a `.env` file and parsed securely via `/config/env.js` which throws warnings on missing keys.

*Note: Rate Limiting (e.g., `express-rate-limit`) and advanced Helmet headers are recommended additions prior to public production deployment.*

## 2. Scaling Strategy (100,000+ Users)
As user volume scales, the monolithic Express architecture will require the following infrastructural evolution:

### A. Horizontal Worker Scaling
Currently, the Express API and BullMQ worker run in the same Node.js runtime or as parallel monolithic instances. 
- **Action**: Completely decouple `reminderWorker.js` into its own lightweight Docker container.
- **Benefit**: As background reminder volume spikes (e.g., millions of 8:00 AM push notifications), we can dynamically spin up 50+ Worker containers connected to the Redis queue without stealing CPU cycles from the main Express REST API handling user traffic.

### B. Redis Clustering
- **Action**: Migrate from a single Redis instance to AWS ElastiCache (Redis Cluster).
- **Benefit**: Prevents the queue from becoming a Single Point of Failure (SPOF) and handles high-throughput message brokering for BullMQ and Socket.io Pub/Sub adapters.

### C. Socket.io Multi-Node Sync
- **Action**: Introduce the `socket.io-redis` adapter.
- **Benefit**: When scaling Express horizontally behind a load balancer, Caregiver A might connect to Node 1, while Patient B connects to Node 2. The Redis adapter ensures WebSocket events are published across all nodes, guaranteeing real-time sync regardless of which server holds the TCP connection.

### D. Database Indexing & Sharding
- **Action**: Implement Geo-Sharding on MongoDB Atlas.
- **Benefit**: Keeps DoseLog read/write operations lightning-fast by storing North American user data in `us-east-1` clusters and European data in `eu-central-1`.
