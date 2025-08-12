import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface Driver {
  _id: string;
  name: string;
  currentShiftHours: number;
  past7DayWorkHours: number;
  isActive: boolean;
  fatigueLevel: number;
}

interface Route {
  _id: string;
  routeId: string;
  name: string;
  distance: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTime: number;
  isActive: boolean;
}

interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  value: number;
  assignedRoute: Route;
  assignedDriver?: Driver;
  deliveryTimestamp: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  isOnTime?: boolean;
  penalty: number;
  bonus: number;
  fuelCost: number;
  profit: number;
}

interface DashboardData {
  totalProfit: number;
  efficiencyScore: number;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  pendingOrders: number;
  deliveryStatusData: Array<{name: string; value: number; color: string}>;
  fuelCostData: Array<{name: string; value: number; color: string}>;
}

interface DataContextType {
  drivers: Driver[];
  routes: Route[];
  orders: Order[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDrivers: () => Promise<void>;
  fetchRoutes: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  createDriver: (driver: Omit<Driver, '_id'>) => Promise<void>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  createRoute: (route: Omit<Route, '_id'>) => Promise<void>;
  updateRoute: (id: string, route: Partial<Route>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  createOrder: (order: Omit<Order, '_id' | 'assignedRoute'> & {assignedRoute: string}) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  runSimulation: (params: {availableDrivers: number; routeStartTime: string; maxHoursPerDriver: number}) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    setError(message);
    throw new Error(message);
  };

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('backend/drivers');
      setDrivers(response.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('backend/routes');
      setRoutes(response.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('backend/orders');
      setOrders(response.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('backend/simulation/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDriver = async (driver: Omit<Driver, '_id'>) => {
    try {
      const response = await axios.post('backend/drivers', driver);
      setDrivers(prev => [...prev, response.data.data]);
    } catch (error) {
      handleError(error);
    }
  };

  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    try {
      const response = await axios.put(`backend/drivers/${id}`, driver);
      setDrivers(prev => prev.map(d => d._id === id ? response.data.data : d));
    } catch (error) {
      handleError(error);
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await axios.delete(`backend/drivers/${id}`);
      setDrivers(prev => prev.filter(d => d._id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  const createRoute = async (route: Omit<Route, '_id'>) => {
    try {
      const response = await axios.post('backend/routes', route);
      setRoutes(prev => [...prev, response.data.data]);
    } catch (error) {
      handleError(error);
    }
  };

  const updateRoute = async (id: string, route: Partial<Route>) => {
    try {
      const response = await axios.put(`backend/routes/${id}`, route);
      setRoutes(prev => prev.map(r => r._id === id ? response.data.data : r));
    } catch (error) {
      handleError(error);
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await axios.delete(`backend/routes/${id}`);
      setRoutes(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  const createOrder = async (order: Omit<Order, '_id' | 'assignedRoute'> & {assignedRoute: string}) => {
    try {
      const response = await axios.post('backend/orders', order);
      setOrders(prev => [...prev, response.data.data]);
    } catch (error) {
      handleError(error);
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      const response = await axios.put(`backend/orders/${id}`, order);
      setOrders(prev => prev.map(o => o._id === id ? response.data.data : o));
    } catch (error) {
      handleError(error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await axios.delete(`backend/orders/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  const runSimulation = async (params: {availableDrivers: number; routeStartTime: string; maxHoursPerDriver: number}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('backend/simulation/run', params);
      // Refresh data after simulation
      await Promise.all([fetchOrders(), fetchDashboardData()]);
      return response.data.data;
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    drivers,
    routes,
    orders,
    dashboardData,
    loading,
    error,
    fetchDrivers,
    fetchRoutes,
    fetchOrders,
    fetchDashboardData,
    createDriver,
    updateDriver,
    deleteDriver,
    createRoute,
    updateRoute,
    deleteRoute,
    createOrder,
    updateOrder,
    deleteOrder,
    runSimulation
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};