import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiPlay, 
  FiUsers, 
  FiMapPin, 
  FiPackage,
  FiTruck 
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Simulation', href: '/simulation', icon: FiPlay },
  { name: 'Drivers', href: '/drivers', icon: FiUsers },
  { name: 'Routes', href: '/routes', icon: FiMapPin },
  { name: 'Orders', href: '/orders', icon: FiPackage },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-green-800 text-white flex flex-col">
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center space-x-3">
          <FiTruck className="h-8 w-8 text-green-300" />
          <div>
            <h2 className="text-lg font-semibold">GreenCart</h2>
            <p className="text-xs text-green-300">Operations Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-green-700">
        <div className="bg-green-700 rounded-lg p-3">
          <p className="text-xs text-green-200 font-medium">Eco-Friendly</p>
          <p className="text-sm text-green-100 mt-1">Sustainable deliveries for a better future</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;