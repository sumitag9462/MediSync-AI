const DoseLog = require('../models/DoseLog');

class MissedDosePredictionService {
    async predictRisk(userId) {
        // Fetch last 30 days of dose logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await DoseLog.find({ user: userId, actionTime: { $gte: thirtyDaysAgo } }).lean();
        
        if (logs.length === 0) return { riskScore: 0, factors: [] };

        const missedLogs = logs.filter(l => l.status === 'Missed');
        const missedRate = missedLogs.length / logs.length;
        let riskScore = Math.min(Math.round(missedRate * 100 * 1.5), 100); // Scale up a bit for sensitivity

        const factors = [];
        if (riskScore > 0) {
            // Group missed doses by time of day (morning vs evening)
            let morningMisses = 0;
            let eveningMisses = 0;
            
            missedLogs.forEach(log => {
                const hour = new Date(log.actionTime).getHours();
                if (hour < 12) morningMisses++;
                else eveningMisses++;
            });

            if (morningMisses > eveningMisses * 2) {
                factors.push("You frequently miss morning doses. Consider setting a louder alarm or pairing it with breakfast.");
            } else if (eveningMisses > morningMisses * 2) {
                factors.push("Evening doses are often missed. Try linking them to your dinner routine.");
            }
        }

        if (missedRate > 0.3) {
            factors.push("Your overall adherence has dropped significantly. Consistent medication is crucial for effectiveness.");
        }

        let label = 'Low';
        if (riskScore > 30) label = 'Medium';
        if (riskScore > 60) label = 'High';

        return { riskScore, label, factors };
    }
}

module.exports = new MissedDosePredictionService();
