const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const DrugProfile = require('../models/DrugProfile');

class DrugIntelligenceService {
    async normalizeMedication(name) {
        try {
            // Check cache first (approximate match)
            const cached = await DrugProfile.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (cached) return cached;

            // 1. RxNorm Lookup
            const rxNormResponse = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
            const rxCui = rxNormResponse.data?.idGroup?.rxnormId?.[0];
            
            if (!rxCui) {
                logger.warn(`No RxCUI found for medication: ${name}`);
                return null;
            }

            // Check cache by rxCui
            let drugProfile = await DrugProfile.findOne({ rxCui });
            if (drugProfile) return drugProfile;

            // 2. OpenFDA Lookup
            let openFdaData = { warnings: [], contraindications: [], adverseReactions: [], pregnancyCategory: '', blackBoxWarnings: [] };
            let activeIngredients = [];
            let brandNames = [];
            let normalizedName = name;

            try {
                const fdaResponse = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.rxcui:${rxCui}&limit=1`);
                const fdaResult = fdaResponse.data?.results?.[0];
                if (fdaResult) {
                    if (fdaResult.openfda) {
                        brandNames = fdaResult.openfda.brand_name || [];
                        activeIngredients = fdaResult.openfda.generic_name || [];
                        normalizedName = activeIngredients[0] || brandNames[0] || name;
                    }
                    openFdaData = {
                        warnings: fdaResult.warnings || [],
                        contraindications: fdaResult.contraindications || [],
                        adverseReactions: fdaResult.adverse_reactions || [],
                        pregnancyCategory: fdaResult.pregnancy_or_breast_feeding || fdaResult.pregnancy || '',
                        blackBoxWarnings: fdaResult.boxed_warning || []
                    };
                }
            } catch (fdaError) {
                logger.warn(`OpenFDA lookup failed for RxCUI: ${rxCui}`);
                // Proceed without OpenFDA data
            }

            // Create and cache profile
            drugProfile = await DrugProfile.create({
                rxCui,
                normalizedName,
                brandNames,
                activeIngredients,
                openFdaData
            });

            return drugProfile;
        } catch (error) {
            logger.error(`Drug normalization error for ${name}:`, error.message);
            return null;
        }
    }

    async analyzeInteractions(newDrugProfile, activeMedicines) {
        if (!newDrugProfile || activeMedicines.length === 0) {
            return {
                overallScore: 'Safe',
                interactions: [],
                duplicateTherapies: [],
                aiSafetySummary: 'No significant interactions detected based on available data.'
            };
        }

        const activeProfiles = activeMedicines.map(m => m.drugProfile).filter(Boolean);
        if (activeProfiles.length === 0) return { overallScore: 'Safe', interactions: [], duplicateTherapies: [] };

        const allDrugsContext = [newDrugProfile, ...activeProfiles].map(p => ({
            name: p.normalizedName,
            ingredients: p.activeIngredients.join(', '),
            contraindications: p.openFdaData.contraindications.slice(0, 2).join(' ')
        }));

        try {
            const prompt = `
            You are a clinical decision support AI. Analyze the following list of medications for potential drug-to-drug interactions and duplicate therapies.
            Medications: ${JSON.stringify(allDrugsContext)}
            
            Return ONLY a valid JSON object with the following structure, do not include markdown formatting like \`\`\`json:
            {
                "overallScore": "Safe" | "Mild" | "Moderate" | "Severe",
                "interactions": [
                    { "medicineA": "String", "medicineB": "String", "severity": "Mild" | "Moderate" | "Severe", "aiExplanation": "Why it interacts and symptoms", "recommendation": "What to do" }
                ],
                "duplicateTherapies": [
                    { "medicines": ["String"], "reason": "Why it is duplicate" }
                ],
                "aiSafetySummary": "A patient-friendly overall summary. Clear, non-alarming, and states this is not medical advice."
            }`;

            const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
            const response = await axios.post(GEMINI_API_URL, {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }, { headers: { 'Content-Type': 'application/json' } });
            
            const rawResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            let result;
            try {
                // Strip markdown backticks if present
                const jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                result = JSON.parse(jsonStr);
            } catch (e) {
                logger.error('Failed to parse Gemini response as JSON', { raw: rawResponse });
                result = { overallScore: 'Safe', interactions: [], duplicateTherapies: [], aiSafetySummary: 'Unable to generate advanced safety insights at this time. Please consult your doctor.' };
            }

            return result;
        } catch (error) {
            logger.error('Error generating AI safety analysis:', error.message);
            return { overallScore: 'Safe', interactions: [], duplicateTherapies: [], aiSafetySummary: 'Analysis currently unavailable.' };
        }
    }
}

module.exports = new DrugIntelligenceService();
