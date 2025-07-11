import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreAdminSidebar from '../Component/StoreAdminSidebar';
import StoreAdminAdd from './StoreAdminAdd';
import StoreAdminList from './StoreAdminList';
import StoreAdminOrders from './StoreAdminOrders';
import SalesReportGenerator from './SalesReportGenerator';

const StoreAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin token and role
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    if (!adminToken || adminUser.role !== 'store_manager') {
      navigate('/stafflogin');
      return;
    }
    
    setToken(adminToken);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/stafflogin');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <StoreAdminAdd token={token} />;
      case 'list':
        return <StoreAdminList token={token} />;
      case 'orders':
        return <StoreAdminOrders token={token} />;
      case 'reports':
        return <SalesReportGenerator token={token} />;
      default:
        return <StoreAdminAdd token={token} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StoreAdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
      />
      <div className="flex-1 p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Store Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors"
          >
            Logout
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StoreAdminDashboard; 