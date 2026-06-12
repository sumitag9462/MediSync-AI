const mongoose = require('mongoose');
const User = require('./models/User');
const Schedule = require('./models/Schedule');
const DoseLog = require('./models/DoseLog');
require('dotenv').config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'sumitagrawal9462@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found!");
        process.exit(1);
    }
    const userId = user._id;

    // Clear old data
    await Schedule.deleteMany({ user: userId });
    await DoseLog.deleteMany({ user: userId });

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(now.getDate() + 30);

    const schedules = [
        {
            user: userId,
            name: "Vitamin C",
            dosage: "500mg",
            times: ["08:00"],
            startDate: oneWeekAgo,
            duration: "30 days",
            endDate: oneMonthFromNow,
            isActive: true
        },
        {
            user: userId,
            name: "Lisinopril",
            dosage: "10mg",
            times: ["20:00"],
            startDate: oneWeekAgo,
            duration: "30 days",
            endDate: oneMonthFromNow,
            isActive: true
        },
        {
            user: userId,
            name: "Amoxicillin",
            dosage: "250mg",
            times: ["08:00", "16:00", "23:00"],
            startDate: oneWeekAgo,
            duration: "10 days",
            endDate: new Date(oneWeekAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
            isActive: true
        }
    ];

    const createdSchedules = await Schedule.insertMany(schedules);
    const doseLogs = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        for (const schedule of createdSchedules) {
            for (const time of schedule.times) {
                const scheduledTime = new Date(`${dateStr}T${time}:00`);
                if (scheduledTime > now) continue;

                // 80% chance Taken, 10% Missed, 10% Skipped
                const rand = Math.random();
                let status = "Taken";
                if (rand > 0.9) status = "Missed";
                else if (rand > 0.8) status = "Skipped";

                doseLogs.push({
                    user: userId,
                    scheduleId: schedule._id,
                    medicationName: `${schedule.name} ${schedule.dosage}`,
                    scheduledTime: scheduledTime,
                    time: time,
                    actionTime: new Date(scheduledTime.getTime() + Math.random() * 30 * 60000), // Action time within 30 mins
                    status: status
                });
            }
        }
    }

    await DoseLog.insertMany(doseLogs);
    console.log(`Successfully seeded ${createdSchedules.length} schedules and ${doseLogs.length} dose logs.`);
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
