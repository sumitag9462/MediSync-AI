const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');

const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate);
    const parts = duration.trim().split(' ');
    const num = parseInt(parts[0]);
    const unit = (parts[1] || '').toLowerCase();
    switch (unit) {
        case 'day': case 'days': start.setDate(start.getDate() + num); break;
        case 'week': case 'weeks': start.setDate(start.getDate() + num * 7); break;
        case 'fortnight': start.setDate(start.getDate() + num * 14); break;
        case 'month': case 'months': start.setMonth(start.getMonth() + num); break;
    }
    return start;
};

const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(schedules);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const createSchedule = async (req, res) => {
    try {
        const { name, dosage, times, startDate, duration } = req.body;
        if (!name || !dosage || !times || !startDate || !duration)
            return res.status(400).json({ message: 'All fields are required.' });
        const endDate = calculateEndDate(startDate, duration);
        const created = await new Schedule({ user: req.user._id, name, dosage, times, startDate, duration, endDate }).save();
        res.status(201).json(created);
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const updateSchedule = async (req, res) => {
    try {
        const { name, dosage, times, startDate, duration, isActive, googleEventIds } = req.body;
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule || schedule.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Schedule not found or user not authorized' });
        schedule.name = name ?? schedule.name;
        schedule.dosage = dosage ?? schedule.dosage;
        schedule.times = times ?? schedule.times;
        schedule.startDate = startDate ?? schedule.startDate;
        schedule.duration = duration ?? schedule.duration;
        schedule.isActive = isActive ?? schedule.isActive;
        schedule.googleEventIds = googleEventIds ?? schedule.googleEventIds;
        if (startDate || duration) schedule.endDate = calculateEndDate(schedule.startDate, schedule.duration);
        res.json(await schedule.save());
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule || schedule.user.toString() !== req.user._id.toString())
            return res.status(404).json({ message: 'Schedule not found or user not authorized' });
        await schedule.deleteOne();
        await DoseLog.deleteMany({ scheduleId: req.params.id });
        res.json({ message: 'Schedule removed successfully' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
