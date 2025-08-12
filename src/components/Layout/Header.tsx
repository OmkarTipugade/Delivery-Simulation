import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLogOut } from 'react-icons/fi';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GreenCart Logistics</h1>
        <p className="text-sm text-gray-600">Eco-friendly delivery operations</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FiUser className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-700">{user?.username}</span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiLogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;