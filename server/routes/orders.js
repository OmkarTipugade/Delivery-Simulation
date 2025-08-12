const express = require('express');
const Order = require('../models/Order');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('assignedRoute', 'routeId name distance trafficLevel')
      .populate('assignedDriver', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: orders.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('assignedRoute')
      .populate('assignedDriver');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { assignedRoute } = req.body;
    
    // Validate that the route exists
    if (assignedRoute) {
      const route = await Route.findById(assignedRoute);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Invalid route ID'
        });
      }
    }

    const order = new Order(req.body);
    await order.save();
    
    await order.populate('assignedRoute assignedDriver');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { assignedRoute, assignedDriver } = req.body;
    
    // Validate route if provided
    if (assignedRoute) {
      const route = await Route.findById(assignedRoute);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Invalid route ID'
        });
      }
    }
    
    // Validate driver if provided
    if (assignedDriver) {
      const driver = await Driver.findById(assignedDriver);
      if (!driver) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver ID'
        });
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedRoute assignedDriver');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;