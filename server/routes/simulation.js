const express = require('express');
const Order = require('../models/Order');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Simulation endpoint
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { availableDrivers, routeStartTime, maxHoursPerDriver } = req.body;

    // Input validation
    if (!availableDrivers || !routeStartTime || !maxHoursPerDriver) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: availableDrivers, routeStartTime, maxHoursPerDriver'
      });
    }

    if (availableDrivers <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Available drivers must be greater than 0'
      });
    }

    if (maxHoursPerDriver <= 0 || maxHoursPerDriver > 24) {
      return res.status(400).json({
        success: false,
        message: 'Max hours per driver must be between 0 and 24'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(routeStartTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM format (e.g., 09:30)'
      });
    }

    // Get all active drivers and check if we have enough
    const drivers = await Driver.find({ isActive: true }).limit(availableDrivers);
    if (drivers.length < availableDrivers) {
      return res.status(400).json({
        success: false,
        message: `Only ${drivers.length} active drivers available, but ${availableDrivers} requested`
      });
    }

    // Get all pending orders with their routes
    const orders = await Order.find({ status: 'pending' })
      .populate('assignedRoute');

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending orders to process'
      });
    }

    // Run simulation
    const simulationResults = await runDeliverySimulation(
      orders,
      drivers.slice(0, availableDrivers),
      routeStartTime,
      maxHoursPerDriver
    );

    res.json({
      success: true,
      message: 'Simulation completed successfully',
      data: simulationResults
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get dashboard KPIs
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('assignedRoute');

    // Calculate KPIs
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const onTimeDeliveries = deliveredOrders.filter(o => o.isOnTime === true);
    const lateDeliveries = deliveredOrders.filter(o => o.isOnTime === false);

    const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);
    const efficiencyScore = totalOrders > 0 ? (onTimeDeliveries.length / totalOrders) * 100 : 0;

    // Delivery status chart data
    const deliveryStatusData = [
      { name: 'On Time', value: onTimeDeliveries.length, color: '#10B981' },
      { name: 'Late', value: lateDeliveries.length, color: '#EF4444' },
      { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#F59E0B' }
    ];

    // Fuel cost breakdown by traffic level
    const fuelCostBreakdown = {};
    orders.forEach(order => {
      if (order.assignedRoute && order.fuelCost > 0) {
        const traffic = order.assignedRoute.trafficLevel;
        fuelCostBreakdown[traffic] = (fuelCostBreakdown[traffic] || 0) + order.fuelCost;
      }
    });

    const fuelCostData = Object.entries(fuelCostBreakdown).map(([traffic, cost]) => ({
      name: traffic,
      value: Math.round(cost * 100) / 100,
      color: traffic === 'High' ? '#EF4444' : traffic === 'Medium' ? '#F59E0B' : '#10B981'
    }));

    res.json({
      success: true,
      data: {
        totalProfit: Math.round(totalProfit * 100) / 100,
        efficiencyScore: Math.round(efficiencyScore * 100) / 100,
        totalOrders,
        onTimeDeliveries: onTimeDeliveries.length,
        lateDeliveries: lateDeliveries.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        deliveryStatusData,
        fuelCostData
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Simulation logic implementation
async function runDeliverySimulation(orders, drivers, startTime, maxHours) {
  const simulationResults = {
    processedOrders: 0,
    totalProfit: 0,
    efficiencyScore: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
    totalFuelCost: 0,
    driverUtilization: [],
    orderDetails: []
  };

  // Parse start time
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDateTime = new Date();
  startDateTime.setHours(hours, minutes, 0, 0);

  // Distribute orders among drivers
  const ordersPerDriver = Math.ceil(orders.length / drivers.length);
  let currentTime = new Date(startDateTime);

  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const driverOrders = orders.slice(i * ordersPerDriver, (i + 1) * ordersPerDriver);
    
    let driverWorkHours = 0;
    let driverProfit = 0;
    let driverDeliveries = 0;
    let driverOnTime = 0;

    // Apply fatigue rule if driver worked > 8 hours yesterday
    const speedMultiplier = driver.past7DayWorkHours > 56 ? 0.7 : 1.0; // 30% slower if fatigued

    for (const order of driverOrders) {
      if (driverWorkHours >= maxHours) break; // Driver reached max hours

      const route = order.assignedRoute;
      let deliveryTime = route.baseTime;

      // Apply speed reduction for fatigue
      if (speedMultiplier < 1.0) {
        deliveryTime = deliveryTime / speedMultiplier;
      }

      // Calculate fuel cost
      let fuelCost = route.distance * 5; // Base cost ₹5/km
      if (route.trafficLevel === 'High') {
        fuelCost += route.distance * 2; // Additional ₹2/km for high traffic
      }

      // Determine if delivery is on time (base time + 10 minutes tolerance)
      const isOnTime = deliveryTime <= (route.baseTime + 10);
      
      // Calculate penalties and bonuses
      let penalty = 0;
      let bonus = 0;

      if (!isOnTime) {
        penalty = 50; // Late delivery penalty
      }

      if (order.value > 1000 && isOnTime) {
        bonus = order.value * 0.10; // 10% bonus for high-value on-time deliveries
      }

      // Calculate profit for this order
      const orderProfit = order.value + bonus - penalty - fuelCost;

      // Update order in database
      await Order.findByIdAndUpdate(order._id, {
        assignedDriver: driver._id,
        status: 'delivered',
        actualDeliveryTime: new Date(currentTime.getTime() + deliveryTime * 60000),
        isOnTime: isOnTime,
        penalty: penalty,
        bonus: bonus,
        fuelCost: fuelCost,
        profit: orderProfit
      });

      // Update simulation results
      simulationResults.processedOrders++;
      simulationResults.totalProfit += orderProfit;
      simulationResults.totalFuelCost += fuelCost;

      if (isOnTime) {
        simulationResults.onTimeDeliveries++;
        driverOnTime++;
      } else {
        simulationResults.lateDeliveries++;
      }

      driverProfit += orderProfit;
      driverDeliveries++;
      driverWorkHours += deliveryTime / 60; // Convert minutes to hours

      simulationResults.orderDetails.push({
        orderId: order.orderId,
        customerName: order.customerName,
        value: order.value,
        driverName: driver.name,
        routeName: route.name,
        isOnTime: isOnTime,
        penalty: penalty,
        bonus: bonus,
        fuelCost: fuelCost,
        profit: orderProfit,
        deliveryTime: Math.round(deliveryTime)
      });

      // Update current time for next delivery
      currentTime = new Date(currentTime.getTime() + deliveryTime * 60000);
    }

    simulationResults.driverUtilization.push({
      driverName: driver.name,
      hoursWorked: Math.round(driverWorkHours * 100) / 100,
      deliveries: driverDeliveries,
      onTimeDeliveries: driverOnTime,
      profit: Math.round(driverProfit * 100) / 100,
      efficiency: driverDeliveries > 0 ? (driverOnTime / driverDeliveries) * 100 : 0
    });
  }

  // Calculate overall efficiency score
  simulationResults.efficiencyScore = simulationResults.processedOrders > 0 
    ? (simulationResults.onTimeDeliveries / simulationResults.processedOrders) * 100 
    : 0;

  // Round values
  simulationResults.totalProfit = Math.round(simulationResults.totalProfit * 100) / 100;
  simulationResults.totalFuelCost = Math.round(simulationResults.totalFuelCost * 100) / 100;
  simulationResults.efficiencyScore = Math.round(simulationResults.efficiencyScore * 100) / 100;

  return simulationResults;
}

module.exports = router;