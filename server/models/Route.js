const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: [true, 'Route ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0.1, 'Distance must be at least 0.1 km']
  },
  trafficLevel: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  baseTime: {
    type: Number,
    required: [true, 'Base time is required'],
    min: [1, 'Base time must be at least 1 minute']
  },
  isActive: {
    type: Boolean,
    default: true
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

routeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Route', routeSchema);