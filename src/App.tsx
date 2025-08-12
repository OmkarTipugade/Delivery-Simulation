import React from 'react';
import { BrowserRouter as Router, Routes as Routess, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Simulation from './pages/Simulation/Simulation';
import Drivers from './pages/Management/Drivers';
import Routes from './pages/Management/Routes';
import Orders from './pages/Management/Orders';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routess>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="simulation" element={<Simulation />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="routes" element={<Routes />} />
                <Route path="orders" element={<Orders />} />
              </Route>
            </Routess>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;