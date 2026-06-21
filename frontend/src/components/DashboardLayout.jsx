import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-20 lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
