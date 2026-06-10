const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');
const { protect } = require('../middleware/authMiddleware');
const axios = require('axios');

// GET /api/chatbot/context
router.get('/context', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const [schedules, recentLogs] = await Promise.all([
            Schedule.find({ user: userId, isActive: true }).sort({ createdAt: -1 }),
            DoseLog.find({ user: userId }).sort({ actionTime: -1 }).limit(20)
        ]);
        const context = {
            schedules: schedules.map(s => ({
                name: s.name,
                dosage: s.dosage,
                times: s.times,
                frequency: s.frequency,
                startDate: s.startDate,
                endDate: s.endDate
            })),
            recentHistory: recentLogs.map(log => ({
                name: log.medicationName,
                status: log.status,
                loggedAt: log.actionTime
            }))
        };
        res.json(context);
    } catch (error) {
        console.error("Error fetching context for chatbot:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/chatbot/message
router.post('/message', protect, async (req, res) => {
    try {
        const { history, input, systemPrompt } = req.body;

        // sanitize history to only include role and text
        const sanitizedHistory = history.map(msg => ({
            role: msg.role,
            parts: msg.parts.map(p => ({ text: p.text }))
        }));

        const payload = {
            contents: [
                ...sanitizedHistory.slice(-20), // send only last 20 messages
                { role: "user", parts: [{ text: input }] }
            ],
            system_instruction: {
                role: "system",
                parts: [{ text: systemPrompt }]
            }
        };

        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await axios.post(GEMINI_API_URL, payload, {
            headers: { "Content-Type": "application/json" }
        });

        const modelMessage =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn’t generate a response.";

        res.json({ reply: modelMessage });

    } catch (error) {
        console.error("Gemini API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "An error occurred while contacting the AI service." });
    }
});

module.exports = router;
