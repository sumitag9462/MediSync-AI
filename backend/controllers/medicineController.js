const Medicine = require('../models/Medicine');

const getMedicines = async (req, res) => {
    try { res.json(await Medicine.find({ user: req.user._id })); }
    catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const createMedicine = async (req, res) => {
    try {
        const { name, dosage, times, frequency } = req.body;
        if (!name || !dosage || !frequency) return res.status(400).json({ message: 'name, dosage, and frequency are required.' });
        const created = await new Medicine({ name, dosage, times, frequency, user: req.user._id }).save();
        res.status(201).json(created);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const updateMedicine = async (req, res) => {
    try {
        const { name, dosage, times, frequency } = req.body;
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine || medicine.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Medicine not found or user not authorized' });
        medicine.name = name || medicine.name;
        medicine.dosage = dosage || medicine.dosage;
        medicine.times = times || medicine.times;
        medicine.frequency = frequency || medicine.frequency;
        res.json(await medicine.save());
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
