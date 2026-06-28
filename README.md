# MediSync-AI 
**An Enterprise-Grade AI Healthcare Intelligence Platform**

MediSync-AI is a distributed, offline-capable MERN stack application augmented with real-time web sockets, background job processing, and Google Gemini AI. It transforms personal medication management into a collaborative, intelligent healthcare ecosystem.

## Features
- **AI Health Copilot & RAG Chatbot**: Context-aware AI that analyzes your specific symptoms, adherence logs, and active medications.
- **Background Reminder Engine**: Redis & BullMQ powered system guaranteeing execution of native OS push notifications via PWA Service Workers.
- **Prescription OCR**: Gemini Vision extraction of messy prescription images into structured schedules.
- **Drug Interaction Intelligence**: OpenFDA integration to instantly flag severe drug combinations.
- **Caregiver Dashboard**: Socket.io powered real-time adherence synchronization across multiple devices.
- **Offline PWA Support**: Reliable caching for low-connectivity environments.

## Comprehensive Documentation
We maintain strict, enterprise-grade documentation detailing our architecture, engineering metrics, testing protocols, and security strategies. 

Please explore the `docs/` directory:
- [Architecture & Design](docs/Architecture.md)
- [Database Schemas & ER Diagrams](docs/Database.md)
- [Testing Protocol & Benchmarks](docs/Testing.md)
- [Security & Scaling Strategy](docs/Security_and_Scaling.md)
- [Lessons Learned](docs/Lessons_Learned.md)

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Axios, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, BullMQ
- **Database**: MongoDB Atlas, Mongoose
- **Cache/Queue**: Redis
- **AI & APIs**: Google Gemini Flash 2.5, OpenFDA, Twilio
- **Deployment Architecture**: REST API + WSS + Background Workers

## Quick Start
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Start Redis (Docker)
docker-compose up -d

# 3. Start Application
# Terminal 1: Backend
npm run dev
# Terminal 2: Frontend
npm run dev
```

*Built by Sumit Agrawal*
