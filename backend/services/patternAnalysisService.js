const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const SymptomLog = require('../models/SymptomLog');
const DoseLog = require('../models/DoseLog');
const InsightCache = require('../models/InsightCache');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

class PatternAnalysisService {
    async analyzeUserPatterns(userId) {
        try {
            // Fetch last 30 days of data
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [symptoms, doseLogs] = await Promise.all([
                SymptomLog.find({ user: userId, loggedAt: { $gte: thirtyDaysAgo } }).sort({ loggedAt: 1 }).lean(),
                DoseLog.find({ user: userId, actionTime: { $gte: thirtyDaysAgo } }).sort({ actionTime: 1 }).lean()
            ]);

            if (symptoms.length === 0 && doseLogs.length === 0) {
                return { insights: [] };
            }

            const prompt = `
            Analyze the following patient data covering the last 30 days to find patterns.
            Look for correlations between missed/taken medications and symptom severity.
            
            Symptoms Data: ${JSON.stringify(symptoms.map(s => ({ symptom: s.symptomName, severity: s.severity, date: s.loggedAt })))}
            Medication Logs: ${JSON.stringify(doseLogs.map(d => ({ medicine: d.scheduleName || 'Unknown', status: d.status, date: d.actionTime })))}
            
            Return ONLY a JSON object (no markdown, no backticks) with this structure:
            {
                "insights": [
                    { "type": "pattern" | "warning" | "positive" | "suggestion", "message": "Clear explanation of the pattern." }
                ]
            }`;

            const response = await axios.post(GEMINI_API_URL, {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }, { headers: { 'Content-Type': 'application/json' } });
            
            const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonStr);

            // Cache it
            await InsightCache.findOneAndUpdate(
                { user: userId },
                { insights: result.insights, lastAnalyzed: new Date() },
                { upsert: true, new: true }
            );

            return result;
        } catch (error) {
            logger.error(`Pattern analysis failed for user ${userId}:`, error.message);
            return { insights: [] };
        }
    }

    async getCachedInsights(userId) {
        let cache = await InsightCache.findOne({ user: userId });
        // Re-analyze if older than 24 hours or missing
        if (!cache || (new Date() - cache.lastAnalyzed) > 24 * 60 * 60 * 1000) {
            const result = await this.analyzeUserPatterns(userId);
            cache = { insights: result.insights };
        }
        return cache;
    }
}

module.exports = new PatternAnalysisService();
