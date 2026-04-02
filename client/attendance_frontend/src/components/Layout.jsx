import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="page flex justify-center items-center" style={{ height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole={user?.role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
