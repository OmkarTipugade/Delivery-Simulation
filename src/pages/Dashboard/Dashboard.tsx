import React, { useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/UI/Card';
import { FiDollarSign, FiTarget, FiTruck, FiClock, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { dashboardData, fetchDashboardData, loading } = useData();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Profit',
      value: `₹${dashboardData?.totalProfit?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Efficiency Score',
      value: `${dashboardData?.efficiencyScore || 0}%`,
      icon: FiTarget,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'On-Time Deliveries',
      value: dashboardData?.onTimeDeliveries || 0,
      icon: FiClock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Late Deliveries',
      value: dashboardData?.lateDeliveries || 0,
      icon: FiAlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Pending Orders',
      value: dashboardData?.pendingOrders || 0,
      icon: FiPackage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Orders',
      value: dashboardData?.totalOrders || 0,
      icon: FiTruck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your logistics operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-time vs Late Deliveries Chart */}
        <Card title="Delivery Status" subtitle="Distribution of delivery performance">
          {dashboardData?.deliveryStatusData && dashboardData.deliveryStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.deliveryStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dashboardData.deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No delivery data available</p>
              </div>
            </div>
          )}
        </Card>

        {/* Fuel Cost Breakdown Chart */}
        <Card title="Fuel Cost Breakdown" subtitle="Fuel costs by traffic level">
          {dashboardData?.fuelCostData && dashboardData.fuelCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.fuelCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Fuel Cost']} />
                <Legend />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]}>
                  {dashboardData.fuelCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FiTruck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No fuel cost data available</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {dashboardData?.efficiencyScore || 0}%
          </div>
          <p className="text-gray-600">Overall Efficiency</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${dashboardData?.efficiencyScore || 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {((dashboardData?.onTimeDeliveries || 0) / Math.max(dashboardData?.totalOrders || 1, 1) * 100).toFixed(1)}%
          </div>
          <p className="text-gray-600">On-Time Rate</p>
          <p className="text-sm text-gray-500 mt-2">
            {dashboardData?.onTimeDeliveries || 0} of {dashboardData?.totalOrders || 0} orders
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ₹{((dashboardData?.totalProfit || 0) / Math.max(dashboardData?.totalOrders || 1, 1)).toFixed(0)}
          </div>
          <p className="text-gray-600">Avg Profit per Order</p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {dashboardData?.totalOrders || 0} total orders
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;