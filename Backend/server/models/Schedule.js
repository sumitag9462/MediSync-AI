const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
  },
  times: [{
    type: String, // Stored as "HH:mm"
    required: true
  }],
  startDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String, // e.g., "1 day", "1 week", "2 weeks", "fortnight", "1 month"
    required: true
  },
  endDate: {
    type: Date // Calculated from startDate + duration
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  googleEventIds: [{
      type: String,
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
