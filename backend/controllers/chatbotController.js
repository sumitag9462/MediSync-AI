const axios = require('axios');
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const SymptomLog = require('../models/SymptomLog');
const JournalLog = require('../models/JournalLog');

const getChatbotContext = async (req, res) => {
    try {
        const userId = req.user._id;
        const [schedules, recentLogs, recentSymptoms, recentJournals] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }).sort({ createdAt: -1 }),
            DoseLog.find({ user: userId }).sort({ actionTime: -1 }).limit(20),
            SymptomLog.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
            JournalLog.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
        ]);
        res.json({
            schedules: schedules.map(s => ({ name: s.name, dosage: s.dosage, times: s.times, startDate: s.startDate, endDate: s.endDate })),
            recentHistory: recentLogs.map(log => ({ name: log.medicationName, status: log.status, loggedAt: log.actionTime })),
            recentSymptoms: recentSymptoms.map(sym => ({ symptom: sym.symptomName, severity: sym.severity, date: sym.createdAt })),
            recentJournals: recentJournals.map(j => ({ mood: j.mood, transcript: j.transcription, date: j.createdAt }))
        });
    } catch (error) {
        console.error('Chatbot context error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const sendChatbotMessage = async (req, res) => {
    try {
        const { history, input, systemPrompt } = req.body;
        if (!input) return res.status(400).json({ reply: 'No input provided.' });
        const sanitizedHistory = (history || []).map(msg => ({
            role: msg.role,
            parts: msg.parts.map(p => ({ text: p.text })),
        }));
        const payload = {
            contents: [...sanitizedHistory.slice(-20), { role: 'user', parts: [{ text: input }] }],
            system_instruction: {
                role: 'system',
                parts: [{ text: systemPrompt || 'You are MediSync-AI, a highly intelligent and empathetic medical assistant. Use the provided User Data (which includes schedules, adherence history, symptoms, and voice journals) to give highly personalized, context-aware advice. If the user asks why they feel a certain way, check their recent missed doses and symptoms to provide an intelligent hypothesis.' }],
            },
        };
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await axios.post(GEMINI_API_URL, payload, { headers: { 'Content-Type': 'application/json' } });
        const modelMessage = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
        res.json({ reply: modelMessage });
    } catch (error) {
        console.error('Gemini API error:', error.response ? error.response.data : error.message);
        res.status(500).json({ reply: 'An error occurred while contacting the AI service.' });
    }
};

module.exports = { getChatbotContext, sendChatbotMessage };
