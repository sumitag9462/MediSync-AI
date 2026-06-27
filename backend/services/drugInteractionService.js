const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

/**
 * Query OpenFDA for a single medicine by generic name, then brand name as fallback.
 * Returns the drug_interactions text string, or null if not found.
 */
const queryOpenFDA = async (medicineName) => {
    const endpoints = [
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(medicineName)}"&limit=1`,
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(medicineName)}"&limit=1`,
        `https://api.fda.gov/drug/label.json?search=drug_interactions:"${encodeURIComponent(medicineName)}"&limit=1`,
    ];

    for (const url of endpoints) {
        try {
            const res = await axios.get(url, { timeout: 6000 });
            const result = res.data?.results?.[0];
            if (result) {
                return {
                    drugInteractions: result.drug_interactions?.[0] || null,
                    warnings: result.warnings?.[0] || null,
                    contraindications: result.contraindications?.[0] || null,
                    brandNames: result.openfda?.brand_name || [],
                    genericNames: result.openfda?.generic_name || []
                };
            }
        } catch (err) {
            // try next endpoint
        }
    }
    return null;
};

/**
 * Call Gemini to analyze interactions from raw FDA labels.
 */
const analyzeWithGemini = async (newMedicine, existingMedicines, fdaDataMap) => {
    const fdaContext = Object.entries(fdaDataMap)
        .map(([name, data]) => {
            if (!data) return `${name}: No FDA data found.`;
            return `${name}:\n  Drug Interactions: ${data.drugInteractions?.substring(0, 500) || 'N/A'}\n  Warnings: ${data.warnings?.substring(0, 300) || 'N/A'}`;
        })
        .join('\n\n');

    const prompt = `The patient is currently taking: ${existingMedicines.join(', ')}.
They want to add: ${newMedicine}.

FDA drug interaction data retrieved:
${fdaContext}

Analyze for interactions and respond ONLY with valid JSON (no markdown, no code fences):
{
  "interactions": [
    {
      "drug1": "medicine name",
      "drug2": "medicine name",
      "severity": "high/moderate/low",
      "description": "plain English explanation in 1-2 sentences",
      "recommendation": "what the patient should do"
    }
  ],
  "safe": true,
  "summary": "overall 1-sentence safety summary"
}

If no interactions found, return: {"interactions":[],"safe":true,"summary":"No known interactions found."}`;

    try {
        const response = await axios.post(GEMINI_API_URL, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });

        const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        logger.error('Gemini interaction analysis failed:', err.message);
        return { interactions: [], safe: true, summary: 'Unable to analyze interactions at this time. Consult your doctor.' };
    }
};

/**
 * Check a new medicine against a list of existing medicines for interactions.
 * @param {string} newMedicine - The drug being added.
 * @param {string[]} existingMedicines - Names of currently active medications.
 */
const checkInteractions = async (newMedicine, existingMedicines) => {
    if (!existingMedicines || existingMedicines.length === 0) {
        return { interactions: [], safe: true, summary: 'No existing medications to check against.' };
    }

    // Query FDA for all medicines in parallel
    const allDrugs = [newMedicine, ...existingMedicines];
    const fdaResults = await Promise.all(allDrugs.map(queryOpenFDA));
    const fdaDataMap = {};
    allDrugs.forEach((name, i) => { fdaDataMap[name] = fdaResults[i]; });

    // Pass everything to Gemini for intelligent analysis
    return analyzeWithGemini(newMedicine, existingMedicines, fdaDataMap);
};

/**
 * Check all pairwise interactions among a full medication list.
 * @param {string[]} drugNames
 */
const checkInteractionsByName = async (drugNames) => {
    if (!drugNames || drugNames.length < 2) {
        return { interactions: [], safe: true, summary: 'At least 2 medications are needed to check interactions.' };
    }

    const fdaResults = await Promise.all(drugNames.map(queryOpenFDA));
    const fdaDataMap = {};
    drugNames.forEach((name, i) => { fdaDataMap[name] = fdaResults[i]; });

    return analyzeWithGemini(drugNames[0], drugNames.slice(1), fdaDataMap);
};

module.exports = { checkInteractions, checkInteractionsByName };
