# MediSync-AI Lessons Learned & Reflections

## 1. Technical Challenges Overcome
- **Multimodal AI Integration**: Reliably parsing messy prescription images was challenging. While Gemini Vision is powerful, structuring its unstructured text output required precise prompt engineering and enforcing JSON schemas in the system prompt.
- **Background Persistence**: Initially considered `node-cron` for medicine reminders, but realized that Node restarts would wipe all schedules. Shifting to **BullMQ + Redis** introduced infrastructure complexity but was strictly necessary for production reliability.
- **Web Speech API**: Building the Voice Journal revealed browser inconsistencies. Relying on native browser APIs for speech-to-text saves cloud costs but sacrifices cross-platform uniformity (e.g., Firefox).

## 2. Key Architecture Decisions
- Choosing **Socket.io** over long-polling for the Caregiver Dashboard drastically reduced backend load, but required careful consideration of room management (`user_id` vs `workspace_id`) to maintain patient privacy.
- Structuring the app as a **PWA (Progressive Web App)** proved to be the most efficient path to mobile delivery. It enabled VAPID Push Notifications without dealing with Apple/Google App Store approvals.

## 3. What We Would Improve in Version 2
- **Data Vectorization**: The RAG chatbot currently stuffs the last 20 JSON records into the prompt. In V2, we would implement Pinecone or Milvus to vectorize historical health data, allowing semantic search over years of logs.
- **Microservices**: Decoupling the AI logic (Gemini/OpenFDA) into an isolated Python/FastAPI microservice would allow better CPU utilization and easier integration with libraries like LangChain or LlamaIndex.
- **Comprehensive E2E Testing**: Implementing Cypress or Playwright for full end-to-end browser testing to supplement the manual verification processes.
