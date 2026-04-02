import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-shell">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className="layout-body">
        <Sidebar userRole={user?.role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
