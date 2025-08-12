const express = require('express');
const Route = require('../models/Route');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all routes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, trafficLevel } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (trafficLevel) {
      filter.trafficLevel = trafficLevel;
    }

    const routes = await Route.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Route.countDocuments(filter);

    res.json({
      success: true,
      data: routes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: routes.length,
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

// Get route by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new route
router.post('/', authMiddleware, async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update route
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete route
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;