const DoseLog = require('../../server/models/DoseLog');
const Schedule = require('../../server/models/Schedule');

exports.predictMissedDoses = async (userId) => {
  const logs = await DoseLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50);

  const nightMisses = logs.filter(
    log => log.time && ['20','21','22','23'].some(h => log.time.startsWith(h)) && log.status === 'Missed'
  ).length;

  let risk = 'Low';
  if (nightMisses > 5) risk = 'High';
  else if (nightMisses > 2) risk = 'Medium';

  return { risk, missedNightCount: nightMisses };
};

// --- New function to get “today’s schedule” ---
exports.getTodaysSchedule = async (userId) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const schedules = await Schedule.find({ user: userId, isActive: true });

  const todaysMeds = schedules.filter(s => {
    const startDate = new Date(s.startDate);
    const endDate = s.endDate ? new Date(s.endDate) : null;

    // Check start & end dates
    if (today < startDate) return false;
    if (endDate && today > endDate) return false;

    // Frequency logic
    if (s.frequency === 'daily') return true;
    if (s.frequency === 'weekly' && s.daysOfWeek.includes(dayOfWeek)) return true;

    return false;
  });

  return todaysMeds.map(med => ({
    name: med.name,
    dosage: med.dosage,
    times: med.times,
    frequency: med.frequency
  }));
};
