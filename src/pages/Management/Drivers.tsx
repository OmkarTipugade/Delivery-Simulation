import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiClock, FiActivity } from 'react-icons/fi';

interface DriverFormData {
  name: string;
  currentShiftHours: number;
  past7DayWorkHours: number;
  isActive: boolean;
}

const Drivers: React.FC = () => {
  const { drivers, fetchDrivers, createDriver, updateDriver, deleteDriver, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    currentShiftHours: 0,
    past7DayWorkHours: 0,
    isActive: true
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleOpenModal = (driver?: any) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        currentShiftHours: driver.currentShiftHours,
        past7DayWorkHours: driver.past7DayWorkHours,
        isActive: driver.isActive
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: '',
        currentShiftHours: 0,
        past7DayWorkHours: 0,
        isActive: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingDriver) {
        await updateDriver(editingDriver._id, formData);
      } else {
        await createDriver(formData);
      }
      handleCloseModal();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(driverId);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const getFatigueLevel = (hours: number) => {
    if (hours <= 40) return { level: 'Low', color: 'text-green-600 bg-green-100' };
    if (hours <= 56) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'High', color: 'text-red-600 bg-red-100' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-600 mt-1">Manage your delivery team</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <FiPlus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Drivers</p>
              <p className="text-xl font-semibold text-gray-900">{drivers.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-xl font-semibold text-gray-900">
                {drivers.filter(d => d.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Hours/Week</p>
              <p className="text-xl font-semibold text-gray-900">
                {drivers.length > 0 
                  ? Math.round(drivers.reduce((sum, d) => sum + d.past7DayWorkHours, 0) / drivers.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50">
              <FiActivity className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">High Fatigue</p>
              <p className="text-xl font-semibold text-gray-900">
                {drivers.filter(d => d.past7DayWorkHours > 56).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card title="All Drivers" subtitle="Complete list of your delivery team">
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
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    7-Day Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatigue Level
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
                {drivers.map((driver) => {
                  const fatigue = getFatigueLevel(driver.past7DayWorkHours);
                  return (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiUsers className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <span className="font-medium text-gray-900">{driver.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.currentShiftHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.past7DayWorkHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fatigue.color}`}>
                          {fatigue.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          driver.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModal(driver)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(driver._id)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No drivers found. Add your first driver to get started.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <Input
            label="Driver Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter driver name"
            required
          />

          <Input
            label="Current Shift Hours"
            type="number"
            value={formData.currentShiftHours}
            onChange={(e) => setFormData({ ...formData, currentShiftHours: Number(e.target.value) })}
            min={0}
            max={24}
            step={0.5}
            required
          />

          <Input
            label="Past 7-Day Work Hours"
            type="number"
            value={formData.past7DayWorkHours}
            onChange={(e) => setFormData({ ...formData, past7DayWorkHours: Number(e.target.value) })}
            min={0}
            max={168}
            step={0.5}
            required
          />

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
              {editingDriver ? 'Update Driver' : 'Create Driver'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Drivers;