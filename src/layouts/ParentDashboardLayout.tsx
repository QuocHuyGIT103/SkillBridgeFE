import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';

const ParentDashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleMobileSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onToggleMobileSidebar={handleToggleMobileSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParentDashboardLayout;