import React from 'react';
import AdminDashboard from './admin/Dashboard';
import Home from './Home';

const HomeRedirect = () => {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    return <AdminDashboard />;
  }
  return <Home />;
};

export default HomeRedirect; 