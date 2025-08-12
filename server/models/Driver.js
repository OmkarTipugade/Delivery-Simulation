const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Driver name must be at least 2 characters long']
  },
  currentShiftHours: {
    type: Number,
    required: [true, 'Current shift hours is required'],
    min: [0, 'Current shift hours cannot be negative'],
    max: [24, 'Current shift hours cannot exceed 24 hours']
  },
  past7DayWorkHours: {
    type: Number,
    required: [true, 'Past 7-day work hours is required'],
    min: [0, 'Past 7-day work hours cannot be negative'],
    max: [168, 'Past 7-day work hours cannot exceed 168 hours (7 days * 24 hours)']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fatigueLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

driverSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate fatigue level based on work hours
  if (this.past7DayWorkHours > 40) {
    this.fatigueLevel = Math.min(((this.past7DayWorkHours - 40) / 40) * 100, 100);
  } else {
    this.fatigueLevel = 0;
  }
  
  next();
});

module.exports = mongoose.model('Driver', driverSchema);