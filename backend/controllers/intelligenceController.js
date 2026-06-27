const SafetyAssessment = require('../models/SafetyAssessment');
const DrugProfile = require('../models/DrugProfile');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const getSafetyDashboard = async (req, res) => {
    try {
        const assessment = await SafetyAssessment.findOne({ user: req.user._id });
        if (!assessment) {
            return successResponse(res, 200, 'No safety assessment found. Please add medications.', {
                overallScore: 'Safe',
                interactions: [],
                duplicateTherapies: [],
                aiSafetySummary: 'Add medications to generate your personalized safety profile.'
            });
        }
        return successResponse(res, 200, 'Safety dashboard retrieved', assessment);
    } catch (error) {
        logger.error('Safety dashboard error:', error);
        return errorResponse(res, 500, 'Error retrieving safety assessment');
    }
};

const getMedicationProfile = async (req, res) => {
    try {
        const { rxCui } = req.params;
        const profile = await DrugProfile.findOne({ rxCui });
        if (!profile) {
            return errorResponse(res, 404, 'Medication profile not found in cache. Attempt adding it to trigger intelligence lookup.');
        }
        return successResponse(res, 200, 'Medication profile retrieved', profile);
    } catch (error) {
        logger.error('Medication profile error:', error);
        return errorResponse(res, 500, 'Error retrieving medication profile');
    }
};

module.exports = {
    getSafetyDashboard,
    getMedicationProfile
};
