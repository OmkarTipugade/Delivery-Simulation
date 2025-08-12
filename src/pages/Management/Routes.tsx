import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiNavigation, FiClock, FiActivity } from 'react-icons/fi';

interface RouteFormData {
  routeId: string;
  name: string;
  distance: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTime: number;
  isActive: boolean;
}

const Routes: React.FC = () => {
  const { routes, fetchRoutes, createRoute, updateRoute, deleteRoute, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [formData, setFormData] = useState<RouteFormData>({
    routeId: '',
    name: '',
    distance: 0,
    trafficLevel: 'Medium',
    baseTime: 30,
    isActive: true
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleOpenModal = (route?: any) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        routeId: route.routeId,
        name: route.name,
        distance: route.distance,
        trafficLevel: route.trafficLevel,
        baseTime: route.baseTime,
        isActive: route.isActive
      });
    } else {
      setEditingRoute(null);
      setFormData({
        routeId: '',
        name: '',
        distance: 0,
        trafficLevel: 'Medium',
        baseTime: 30,
        isActive: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingRoute) {
        await updateRoute(editingRoute._id, formData);
      } else {
        await createRoute(formData);
      }
      handleCloseModal();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDelete = async (routeId: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(routeId);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routes Management</h1>
          <p className="text-gray-600 mt-1">Manage your delivery routes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <FiPlus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <FiMapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Routes</p>
              <p className="text-xl font-semibold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Routes</p>
              <p className="text-xl font-semibold text-gray-900">
                {routes.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <FiNavigation className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Distance</p>
              <p className="text-xl font-semibold text-gray-900">
                {routes.length > 0 
                  ? Math.round(routes.reduce((sum, r) => sum + r.distance, 0) / routes.length)
                  : 0
                } km
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50">
              <FiClock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-xl font-semibold text-gray-900">
                {routes.length > 0 
                  ? Math.round(routes.reduce((sum, r) => sum + r.baseTime, 0) / routes.length)
                  : 0
                } min
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Routes Table */}
      <Card title="All Routes" subtitle="Complete list of your delivery routes">
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
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traffic Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiMapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{route.name}</div>
                          <div className="text-xs text-gray-500">{route.routeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.distance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.baseTime} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrafficColor(route.trafficLevel)}`}>
                        {route.trafficLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenModal(route)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(route._id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {routes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiMapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No routes found. Add your first route to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Route Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <Input
            label="Route ID"
            type="text"
            value={formData.routeId}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
            placeholder="e.g., RT001"
            required
          />

          <Input
            label="Route Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Downtown to Airport"
            required
          />

          <Input
            label="Distance (km)"
            type="number"
            value={formData.distance}
            onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
            min={0.1}
            step={0.1}
            required
          />

          <Input
            label="Base Time (minutes)"
            type="number"
            value={formData.baseTime}
            onChange={(e) => setFormData({ ...formData, baseTime: Number(e.target.value) })}
            min={1}
            required
          />

          <Select
            label="Traffic Level"
            value={formData.trafficLevel}
            onChange={(e) => setFormData({ ...formData, trafficLevel: e.target.value as any })}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>

          <Select
            label="Status"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            required
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingRoute ? 'Update Route' : 'Create Route'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Routes;