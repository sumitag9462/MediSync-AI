const { processImageForOCR } = require('../services/imageProcessingService');
const { extractPrescriptionData } = require('../services/ocrService');
const { normalizeMedicines } = require('../services/medicationNormalizer');
const OCRHistory = require('../models/OCRHistory');
const Schedule = require('../models/Schedule');
const Medicine = require('../models/Medicine');
const { scheduleNextReminders } = require('../services/reminderSchedulerService');
const fs = require('fs');

/**
 * Handle image upload and OCR extraction.
 */
const uploadAndExtract = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        // 1. Process Image
        const base64Image = await processImageForOCR(filePath);

        // 2. Extract Data using Gemini
        const extractionResult = await extractPrescriptionData(base64Image, mimeType);

        // 3. Normalize Data
        const normalizedMedicines = normalizeMedicines(extractionResult.medicines);

        // 4. Save to OCRHistory (status: pending)
        const newHistory = new OCRHistory({
            user: req.user._id,
            imageUrl: req.file.filename, // We serve static from /uploads
            extractedData: normalizedMedicines,
            confidenceScore: extractionResult.confidenceScore,
            status: 'pending'
        });

        await newHistory.save();

        // 5. Cleanup the uploaded file to save space (Optional depending on strategy)
        // If we want to keep it to show in UI, we shouldn't delete it yet.
        
        return res.status(200).json({
            success: true,
            message: 'Prescription scanned successfully',
            data: {
                historyId: newHistory._id,
                medicines: normalizedMedicines,
                confidenceScore: extractionResult.confidenceScore,
                imageUrl: `/uploads/${req.file.filename}`
            }
        });

    } catch (error) {
        console.error('OCR Upload Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process prescription image.' });
    }
};

/**
 * Save confirmed medication schedule.
 */
const saveOCRSchedule = async (req, res) => {
    try {
        const { historyId, medicines } = req.body;
        const userId = req.user._id;

        if (!medicines || medicines.length === 0) {
            return res.status(400).json({ success: false, message: 'No medicines provided to save.' });
        }

        const savedSchedules = [];
        const savedMedicines = [];

        // Save medicines and schedules in bulk or iterate
        for (const med of medicines) {
            const newMedicine = new Medicine({
                user: userId,
                name: med.name,
                dosage: med.dosage,
                times: med.times || [],
                frequency: med.frequency,
                history: []
            });
            const savedMed = await newMedicine.save();
            savedMedicines.push(savedMed);

            const newSchedule = new Schedule({
                user: userId,
                name: med.name,
                dosage: med.dosage,
                times: med.times || [],
                startDate: new Date(),
                duration: med.duration || 'unknown',
                isActive: true
            });
            const savedSched = await newSchedule.save();
            savedSchedules.push(savedSched);

            // Enqueue Reminders
            await scheduleNextReminders(savedSched);
        }

        // Update History to approved
        if (historyId) {
            await OCRHistory.findByIdAndUpdate(historyId, { 
                status: 'approved',
                extractedData: medicines // Save the final modified version
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medication schedules created successfully.',
            data: { schedules: savedSchedules }
        });

    } catch (error) {
        console.error('OCR Save Schedule Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save schedules.' });
    }
};

/**
 * Get user's OCR history.
 */
const getOCRHistory = async (req, res) => {
    try {
        const history = await OCRHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error('Get OCR History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history.' });
    }
};

module.exports = {
    uploadAndExtract,
    saveOCRSchedule,
    getOCRHistory
};
