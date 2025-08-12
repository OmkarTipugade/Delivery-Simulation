import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { FiPlay, FiTrendingUp, FiUsers, FiClock, FiTarget, FiDollarSign } from 'react-icons/fi';

interface SimulationResult {
  processedOrders: number;
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  totalFuelCost: number;
  driverUtilization: Array<{
    driverName: string;
    hoursWorked: number;
    deliveries: number;
    onTimeDeliveries: number;
    profit: number;
    efficiency: number;
  }>;
  orderDetails: Array<{
    orderId: string;
    customerName: string;
    value: number;
    driverName: string;
    routeName: string;
    isOnTime: boolean;
    penalty: number;
    bonus: number;
    fuelCost: number;
    profit: number;
    deliveryTime: number;
  }>;
}

const Simulation: React.FC = () => {
  const { runSimulation, fetchDrivers, fetchOrders, drivers, loading } = useData();
  const [availableDrivers, setAvailableDrivers] = useState(0);
  const [routeStartTime, setRouteStartTime] = useState('09:00');
  const [maxHoursPerDriver, setMaxHoursPerDriver] = useState(6);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
    fetchOrders();
  }, [fetchDrivers, fetchOrders]);

  const handleRunSimulation = async () => {
    setError('');
    setSimulationLoading(true);

    try {
      const results = await runSimulation({
        availableDrivers,
        routeStartTime,
        maxHoursPerDriver
      });
      setSimulationResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  const activeDriversCount = drivers.filter(d => d.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Simulation</h1>
        <p className="text-gray-600 mt-1">Experiment with different parameters to optimize your operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Form */}
        <Card title="Simulation Parameters" subtitle="Configure your simulation settings">
          <div className="space-y-4">
            <Input
              label="Available Drivers"
              type="number"
              value={availableDrivers}
              onChange={(e) => setAvailableDrivers(Number(e.target.value))}
              max={activeDriversCount}
              required
            />
            <p className="text-xs text-gray-500">
              Maximum: {activeDriversCount} active drivers available
            </p>

            <Input
              label="Route Start Time"
              type="time"
              value={routeStartTime}
              onChange={(e) => setRouteStartTime(e.target.value)}
              required
            />

            <Input
              label="Max Hours per Driver"
              type="number"
              value={maxHoursPerDriver}
              onChange={(e) => setMaxHoursPerDriver(Number(e.target.value))}
              min={1}
              max={24}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleRunSimulation}
              loading={simulationLoading}
              className="w-full"
              disabled={availableDrivers > activeDriversCount}
            >
              <FiPlay className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </Card>

        {/* Simulation Results Summary */}
        {simulationResults && (
          <div className="lg:col-span-2 space-y-4">
            <Card title="Simulation Results" subtitle="Key performance indicators from the simulation">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FiDollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">
                    ₹{simulationResults.totalProfit.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Profit</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FiTarget className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">
                    {simulationResults.efficiencyScore}%
                  </div>
                  <p className="text-sm text-gray-600">Efficiency Score</p>
                </div>

                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <FiTrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-emerald-600">
                    {simulationResults.processedOrders}
                  </div>
                  <p className="text-sm text-gray-600">Orders Processed</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FiClock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-600">
                    {simulationResults.onTimeDeliveries}
                  </div>
                  <p className="text-sm text-gray-600">On-Time Deliveries</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">
                    {simulationResults.lateDeliveries}
                  </div>
                  <p className="text-sm text-gray-600">Late Deliveries</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    ₹{simulationResults.totalFuelCost.toFixed(0)}
                  </div>
                  <p className="text-sm text-gray-600">Fuel Cost</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Driver Utilization Table */}
      {simulationResults && (
        <Card title="Driver Utilization" subtitle="Performance breakdown by driver">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours Worked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulationResults.driverUtilization.map((driver, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUsers className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{driver.driverName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.hoursWorked}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.deliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.onTimeDeliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.efficiency >= 80 
                          ? 'bg-green-100 text-green-800'
                          : driver.efficiency >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.efficiency.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{driver.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Details Table */}
      {simulationResults && simulationResults.orderDetails.length > 0 && (
        <Card title="Order Details" subtitle="Detailed breakdown of processed orders">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulationResults.orderDetails.slice(0, 10).map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.routeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.isOnTime
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.isOnTime ? 'On Time' : 'Late'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {simulationResults.orderDetails.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing first 10 of {simulationResults.orderDetails.length} orders
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Simulation;