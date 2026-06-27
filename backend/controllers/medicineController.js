const Medicine = require('../models/Medicine');
const SafetyAssessment = require('../models/SafetyAssessment');
const DrugIntelligenceService = require('../services/DrugIntelligenceService');
const logger = require('../utils/logger');

const getMedicines = async (req, res) => {
    try { res.json(await Medicine.find({ user: req.user._id }).populate('drugProfile')); }
    catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const triggerIntelligencePipeline = async (userId, newMedicine) => {
    try {
        const drugProfile = await DrugIntelligenceService.normalizeMedication(newMedicine.name);
        if (drugProfile) {
            newMedicine.rxCui = drugProfile.rxCui;
            newMedicine.drugProfile = drugProfile._id;
            await newMedicine.save();
        }

        // Fetch all active medicines for interaction check
        const activeMedicines = await Medicine.find({ user: userId, _id: { $ne: newMedicine._id } }).populate('drugProfile');
        
        const analysis = await DrugIntelligenceService.analyzeInteractions(drugProfile, activeMedicines);
        
        await SafetyAssessment.findOneAndUpdate(
            { user: userId },
            { $set: { ...analysis, lastUpdated: new Date() } },
            { upsert: true, new: true }
        );
    } catch (error) {
        logger.error('Error in intelligence pipeline:', error);
    }
};

const createMedicine = async (req, res) => {
    try {
        const { name, dosage, times, frequency } = req.body;
        if (!name || !dosage || !frequency) return res.status(400).json({ message: 'name, dosage, and frequency are required.' });
        
        const created = await new Medicine({ name, dosage, times, frequency, user: req.user._id }).save();
        
        // Trigger background pipeline
        triggerIntelligencePipeline(req.user._id, created);
        
        res.status(201).json(created);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const updateMedicine = async (req, res) => {
    try {
        const { name, dosage, times, frequency } = req.body;
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine || medicine.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Medicine not found or user not authorized' });
        
        const nameChanged = name && name !== medicine.name;
        medicine.name = name || medicine.name;
        medicine.dosage = dosage || medicine.dosage;
        medicine.times = times || medicine.times;
        medicine.frequency = frequency || medicine.frequency;
        
        await medicine.save();

        if (nameChanged) {
            triggerIntelligencePipeline(req.user._id, medicine);
        }

        res.json(medicine);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine || medicine.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Medicine not found or user not authorized' });
        await medicine.deleteOne();
        res.json({ message: 'Medicine removed successfully' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const logMedicineDose = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'status is required.' });
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine || medicine.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Medicine not found or user not authorized' });
        medicine.history.unshift({ status, date: new Date() });
        res.json(await medicine.save());
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine, logMedicineDose };
