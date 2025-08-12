const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Order value is required'],
    min: [0, 'Order value cannot be negative']
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Assigned route is required']
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  deliveryTimestamp: {
    type: Date,
    required: [true, 'Delivery timestamp is required']
  },
  actualDeliveryTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  isOnTime: {
    type: Boolean,
    default: null
  },
  penalty: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  fuelCost: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
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

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);