# 💊 MedWell - Alchemist's Grimoire 🧪  

[![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react&logoColor=white)](https://reactjs.org/) 
[![Node.js](https://img.shields.io/badge/Node.js-18.16.0-green?logo=node.js&logoColor=white)](https://nodejs.org/) 
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0.7-brightgreen?logo=mongodb&logoColor=white)](https://www.mongodb.com/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.3-blue?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)  
[![Vite](https://img.shields.io/badge/Vite-5.1.0-red?logo=vite&logoColor=white)](https://vitejs.dev/)  

**Wellness, brewed with precision.**

MedWell is a **smart medication management platform** built for **Codesangam 2025** under the theme *"Alchemist's Grimoire."* It helps users effortlessly manage medications, track adherence, and achieve wellness goals with **AI assistance, gamification, and advanced reminders**.  

---

## ✨ Features

### 🧱 Core Features
- 🔒 **Secure Authentication:** Registration & login with **JWT**  
- 📧 **Email OTP Verification:** Prevent fake accounts  
- 💊 **Medicine Scheduling:** Add, update, delete schedules with name, dosage, and frequency  
- 🧾 **Dose Logging:** Track *“taken”* or *“missed”* doses  
- 📊 **Wellness Dashboard:**  
  - 🕒 **Upcoming Doses**  
  - 🔄 **Recent Activity Feed**  
  - 📈 **Graphs & Analytics**  
- 🔍 **Search Medicine:** Quickly search for your medications in your schedule  
- 🗓️ **Automatic End Date & Custom Days:** Automatically sets medication end date based on duration and allows selecting specific days for doses  
- 📝 **Dose History:** Saved for up to 7 days  

### 🧠 Advanced Features
- ⏰ **Advanced Reminders:** Multiple alerts, snooze, vibration, location-based notifications  
- 🤖 **AI Chatbot (The Mystic):** Ask natural language questions like *“What do I take today?”*  
- 🗣️ **Voice Assistant Integration:** Ask questions or get reminders via voice commands  
- 🌐 **Multilingual Support:** App available in multiple languages  
- 🎮 **Gamification:** Streaks, achievements, and badges  
- 📅 **Google Calendar Sync:** Schedule syncing with personal calendar  
- 📱 **Device Integration:** Google Fit & smartwatch (UI placeholder)  
- 🏥 **Nearby Clinics:** View nearby clinics on Google Maps within 1–50 km radius with info  
- ⚙️ **Settings Page:** Manage notifications, calendar sync, and app preferences  
- ☕ **Buy Coffee Page:** Support the project via donations  

### 👩‍💻 Team & Community
- 🌟 **About Us Section:** Floating profile cards with photos, emails, phones, GitHub, and LinkedIn links  
- ✉️ **Contact Form:** Send messages to the team directly  

---

## 🛠️ Technology Stack

### Frontend
- ⚛️ React + Vite  
- 🎨 Tailwind CSS  
- 🧩 shadcn/ui components  
- 🎞️ Framer Motion animations  
- 🧭 React Router for navigation  
- 🌐 Axios for API calls  

### Backend
- 🟩 Node.js + Express.js  
- 🗃️ MongoDB with Mongoose  
- 🔐 JWT & bcrypt.js for authentication  
- 📬 Nodemailer for OTP emails  
- 🌍 CORS middleware

### 🎯 Future Roadmap
Shared schedules & caregiver notifications

Proactive AI for habit-based adjustments

Voice assistant expansion

Pharmacy & refill automation

Smart analytics with long-term adherence insights

---



## 🚀 Setup Guide

### Prerequisites
- Node.js & npm  
- MongoDB Atlas account  
- Gmail account with App Password for OTP  

### Backend Setup
```bash
cd Backend/server
npm install
```
### Create .env in Backend/server:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
```
### Start server:
```
node server.js
```
## Backend runs at http://localhost:5000

### Frontend Setup
```
cd frontend
npm install
```

### Create .env in frontend (for API keys):
```
VITE_GEMINI_API_KEY="your gemini api key"
```

### Start development server:
```
npm run dev
```

### Frontend runs at http://localhost:5173

✅ Both frontend and backend should now be running successfully.

# MediSync-AI
