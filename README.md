# 💊 MediSync-AI

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-blue?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-red?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **AI-powered medication management — sync, track, and never miss a dose.**

**MediSync-AI** is a full-stack smart medication management platform that helps users effortlessly manage medications, track adherence, and achieve wellness goals with **AI assistance, gamification, Google Calendar sync, and advanced reminders**.

---

## ✨ Features

### 🧱 Core Features
- 🔒 **Secure Authentication** — Registration & login with **JWT**
- 📧 **Email OTP Verification** — Prevent fake accounts via email-based OTP
- 💊 **Medicine Scheduling** — Add, update, and delete schedules with name, dosage, and frequency
- 🧾 **Dose Logging** — Track *"taken"* or *"missed"* doses with one click
- 📊 **Wellness Dashboard**
  - 🕒 Upcoming Doses
  - 🔄 Recent Activity Feed
  - 📈 Graphs & Analytics
- 🔍 **Search Medicine** — Quickly search through your medication schedule
- 🗓️ **Automatic End Date & Custom Days** — Automatically sets end date based on duration; supports specific day selection
- 📝 **Dose History** — Saved for up to 7 days

### 🧠 Advanced Features
- ⏰ **Advanced Reminders** — Multiple alerts, snooze, vibration, and location-based notifications
- 🤖 **AI Chatbot** — Ask natural language questions like *"What do I take today?"*
- 🗣️ **Voice Assistant Integration** — Ask questions or trigger reminders via voice commands
- 🌐 **Multilingual Support** — App available in multiple languages
- 🎮 **Gamification** — Streaks, achievements, and badges to keep you motivated
- 📅 **Google Calendar Sync** — Sync your medication schedule directly to Google Calendar
- 📱 **Device Integration** — Google Fit & smartwatch support (UI placeholder)
- 🏥 **Nearby Clinics** — View nearby clinics on Google Maps within 1–50 km radius
- ⚙️ **Settings Page** — Manage notifications, calendar sync, and app preferences
- ☕ **Support the Project** — Buy us a coffee via the donation page

### 👩‍💻 Team & Community
- 🌟 **About Us Section** — Floating profile cards with photos, emails, GitHub, and LinkedIn links
- ✉️ **Contact Form** — Send messages to the team directly

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| ⚛️ React + Vite | UI framework & build tool |
| 🎨 Tailwind CSS | Utility-first styling |
| 🧩 shadcn/ui | Accessible UI components |
| 🎞️ Framer Motion | Smooth animations |
| 🧭 React Router | Client-side navigation |
| 🌐 Axios | HTTP API calls |
| 📊 Recharts | Data visualization |

### Backend
| Technology | Purpose |
|---|---|
| 🟩 Node.js + Express.js | REST API server |
| 🗃️ MongoDB + Mongoose | Database & ODM |
| 🔐 JWT + bcrypt.js | Authentication & password hashing |
| 📬 Nodemailer | OTP email delivery |
| 📱 Twilio | SMS OTP delivery |
| 🌍 CORS | Cross-origin resource sharing |

---

## 🚀 Setup Guide

### Prerequisites
- Node.js & npm
- MongoDB Atlas account
- Gmail account with an App Password (for OTP emails)
- Twilio account (optional, for SMS OTP)

---

### Backend Setup

```bash
cd Backend/server
npm install
```

**Create a `.env` file in `Backend/server/`:**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Start the server:**
```bash
node server.js
```

> ✅ Backend runs at `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
```

**Create a `.env` file in `frontend/`:**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Start the development server:**
```bash
npm run dev
```

> ✅ Frontend runs at `http://localhost:5173`

---

✅ **Both frontend and backend should now be running successfully.**

---

## 🎯 Future Roadmap

- [ ] Shared schedules & caregiver notifications
- [ ] Proactive AI for habit-based dose adjustments
- [ ] Expanded voice assistant commands
- [ ] Pharmacy integration & automatic refill reminders
- [ ] Long-term adherence analytics & smart insights
- [ ] Mobile app (React Native)

---

## 🚀 Production Deployment

This project is fully configured for easy 1-click deployments:

### Frontend (Vercel)
The frontend includes a `vercel.json` file for proper React Router handling.
1. Connect your GitHub repository to Vercel.
2. Add your environment variables (`VITE_GEMINI_API_KEY`, `VITE_GOOGLE_CLIENT_ID`).
3. Deploy!

### Backend (Render)
The backend includes a `render.yaml` blueprint.
1. Connect your GitHub repository to Render and use the Blueprint sync.
2. Fill in the required environment variables in the Render dashboard.
3. Deploy!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sumitag9462/MediSync-AI/issues).

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Sumit Agrawal**
- GitHub: [@sumitag9462](https://github.com/sumitag9462)

---

<p align="center">Made with ❤️ by the MediSync-AI team</p>
