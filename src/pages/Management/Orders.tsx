import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiDollarSign, FiTruck, FiClock } from 'react-icons/fi';

interface OrderFormData {
  orderId: string;
  customerName: string;
  value: number;
  assignedRoute: string;
  deliveryTimestamp: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
}

const Orders: React.FC = () => {
  const { orders, routes, fetchOrders, fetchRoutes, createOrder, updateOrder, deleteOrder, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    orderId: '',
    customerName: '',
    value: 0,
    assignedRoute: '',
    deliveryTimestamp: '',
    status: 'pending'
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchRoutes();
  }, [fetchOrders, fetchRoutes]);

  const handleOpenModal = (order?: any) => {
    if (order) {
      setEditingOrder(order);
      const deliveryDate = new Date(order.deliveryTimestamp);
      const formattedDate = deliveryDate.toISOString().slice(0, 16);
      
      setFormData({
        orderId: order.orderId,
        customerName: order.customerName,
        value: order.value,
        assignedRoute: order.assignedRoute?._id || '',
        deliveryTimestamp: formattedDate,
        status: order.status
      });
    } else {
      setEditingOrder(null);
      setFormData({
        orderId: '',
        customerName: '',
        value: 0,
        assignedRoute: '',
        deliveryTimestamp: '',
        status: 'pending'
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      const orderData = {
        ...formData,
        deliveryTimestamp: new Date(formData.deliveryTimestamp).toISOString()
      };

      if (editingOrder) {
        await updateOrder(editingOrder._id, orderData);
      } else {
        await createOrder(orderData);
      }
      handleCloseModal();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'in-transit': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.value, 0);
  const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage your delivery orders</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <FiPlus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <FiPackage className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <FiTruck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-xl font-semibold text-gray-900">₹{totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50">
              <FiClock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-xl font-semibold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card title="All Orders" subtitle="Complete list of your delivery orders">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <FiPackage className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{order.orderId}</div>
                          {order.isOnTime !== null && (
                            <div className={`text-xs ${order.isOnTime ? 'text-green-600' : 'text-red-600'}`}>
                              {order.isOnTime ? 'On Time' : 'Late'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.assignedRoute?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.deliveryTimestamp).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={order.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{order.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenModal(order)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(order._id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No orders found. Add your first order to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOrder ? 'Edit Order' : 'Add New Order'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order ID"
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              placeholder="e.g., ORD001"
              required
            />

            <Input
              label="Customer Name"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Customer name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Value (₹)"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              min={0}
              step={0.01}
              required
            />

            <Select
              label="Assigned Route"
              value={formData.assignedRoute}
              onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
              required
            >
              <option value="">Select a route</option>
              {routes.filter(r => r.isActive).map((route) => (
                <option key={route._id} value={route._id}>
                  {route.name} ({route.routeId})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Delivery Date & Time"
              type="datetime-local"
              value={formData.deliveryTimestamp}
              onChange={(e) => setFormData({ ...formData, deliveryTimestamp: e.target.value })}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
            >
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;