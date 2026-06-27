const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

/**
 * Extracts medication details from a base64 encoded image using Gemini Vision.
 * @param {string} base64Image - Base64 string of the prescription image.
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns {Promise<Object>} - The structured extraction result containing medicines and overall confidence.
 */
const extractPrescriptionData = async (base64Image, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert AI medical assistant trained to read handwritten and printed prescriptions.
        Carefully analyze this prescription image and extract the medication schedule.
        
        Respond ONLY with a valid JSON object in the following format. Do not include markdown formatting or backticks around the JSON.
        
        {
            "confidenceScore": 0.0 to 1.0 (Overall confidence in your extraction),
            "medicines": [
                {
                    "name": "Medicine name (e.g., Paracetamol 500mg)",
                    "dosage": "Dosage amount (e.g., 1 tablet)",
                    "frequency": "Frequency string (e.g., OD, BID, TDS, SOS)",
                    "timingInstructions": "e.g., Morning, Night, After meals",
                    "duration": "e.g., 5 days, 1 week (if not mentioned, output 'unknown')",
                    "specialInstructions": "Any other notes from doctor"
                }
            ]
        }
        
        If you cannot read the prescription at all, return an empty array for medicines and a very low confidenceScore.
        Extract everything you can. Be precise.
        `;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown json block if Gemini includes it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(text);
        return parsedData;

    } catch (error) {
        console.error('Error in OCR extraction with Gemini:', error);
        throw new Error('Failed to extract data using AI Vision.');
    }
};

module.exports = {
    extractPrescriptionData
};
