const EmergencyProfile = require('../models/EmergencyProfile');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const logger = require('../utils/logger');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * POST /api/emergency/profile (Auth: Required)
 * Create or update the emergency profile for the authenticated user.
 */
const upsertEmergencyProfile = async (req, res) => {
    try {
        const { bloodGroup, allergies, emergencyContacts } = req.body;
        let profile = await EmergencyProfile.findOne({ userId: req.user._id });

        if (profile) {
            profile.bloodGroup = bloodGroup ?? profile.bloodGroup;
            profile.allergies = allergies ?? profile.allergies;
            profile.emergencyContacts = emergencyContacts ?? profile.emergencyContacts;
            await profile.save();
        } else {
            profile = await EmergencyProfile.create({
                userId: req.user._id,
                bloodGroup,
                allergies,
                emergencyContacts
            });
        }

        const qrUrl = `${FRONTEND_URL}/emergency/${profile.publicSlug}`;
        res.json({ success: true, data: { profile, qrUrl } });
    } catch (error) {
        logger.error('Upsert emergency profile error:', error);
        res.status(500).json({ success: false, message: 'Error saving emergency profile' });
    }
};

/**
 * GET /api/emergency/profile (Auth: Required)
 * Returns the authenticated user's own emergency profile + QR URL.
 */
const getMyEmergencyProfile = async (req, res) => {
    try {
        const profile = await EmergencyProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.json({ success: true, data: null, message: 'No emergency profile found. Create one.' });
        }
        const qrUrl = `${FRONTEND_URL}/emergency/${profile.publicSlug}`;
        res.json({ success: true, data: { profile, qrUrl } });
    } catch (error) {
        logger.error('Get emergency profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching emergency profile' });
    }
};

/**
 * GET /api/emergency/public/:slug (PUBLIC — No Auth)
 * Returns a read-only card with blood group, medications, allergies, contacts.
 */
const getPublicEmergencyCard = async (req, res) => {
    try {
        const { slug } = req.params;
        const profile = await EmergencyProfile.findOne({ publicSlug: slug });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Emergency card not found' });
        }

        const user = await User.findById(profile.userId).select('name');
        const medications = await Schedule.find({ user: profile.userId, isActive: true })
            .select('name dosage times');

        res.json({
            success: true,
            data: {
                name: user?.name || 'Unknown',
                bloodGroup: profile.bloodGroup,
                allergies: profile.allergies,
                emergencyContacts: profile.emergencyContacts,
                medications: medications.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.times?.length ? `${m.times.length}x daily` : 'N/A'
                }))
            }
        });
    } catch (error) {
        logger.error('Public emergency card error:', error);
        res.status(500).json({ success: false, message: 'Error loading emergency card' });
    }
};

module.exports = { upsertEmergencyProfile, getMyEmergencyProfile, getPublicEmergencyCard };
