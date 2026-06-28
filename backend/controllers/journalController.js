const JournalLog = require('../models/JournalLog');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('../config/env');
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const logJournal = async (req, res) => {
    try {
        const { transcription } = req.body;
        const userId = req.user._id;

        if (!transcription) {
            return res.status(400).json({ success: false, message: 'Transcription is required' });
        }

        // Use Gemini to extract mood and tags (symptoms)
        let mood = 'Neutral';
        let tags = [];

        try {
            if (env.GEMINI.API_KEY) {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `Analyze the following voice journal entry from a patient.
Return a JSON object with strictly these two fields:
- mood: A single word representing the patient's mood (e.g., Happy, Sad, Anxious, Neutral, Pain, Tired)
- tags: An array of strings representing any symptoms, side effects, or key health entities mentioned.

Journal entry: "${transcription}"`;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                // strip markdown if any
                const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiData = JSON.parse(cleanedText);
                
                if (aiData.mood) mood = aiData.mood;
                if (aiData.tags && Array.isArray(aiData.tags)) tags = aiData.tags;
            }
        } catch (aiError) {
            console.error('Gemini journal analysis failed:', aiError);
            // Fallback to default if AI fails
        }

        const journal = await JournalLog.create({
            user: userId,
            transcription,
            mood,
            tags
        });

        res.status(201).json({ success: true, data: journal });
    } catch (error) {
        console.error('Error logging journal:', error);
        res.status(500).json({ success: false, message: 'Failed to log journal' });
    }
};

const getJournals = async (req, res) => {
    try {
        const userId = req.user._id;
        const journals = await JournalLog.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, data: journals });
    } catch (error) {
        console.error('Error fetching journals:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch journals' });
    }
};

module.exports = {
    logJournal,
    getJournals
};
