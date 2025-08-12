const express = require('express');
const Driver = require('../models/Driver');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all drivers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const drivers = await Driver.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Driver.countDocuments(filter);

    res.json({
      success: true,
      data: drivers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: drivers.length,
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

// Get driver by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new driver
router.post('/', authMiddleware, async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update driver
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete driver
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;