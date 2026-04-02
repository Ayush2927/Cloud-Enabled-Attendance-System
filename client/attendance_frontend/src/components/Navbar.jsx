import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiBell, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="flex items-center gap-4">
        <button
          className="btn-icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
          id="sidebar-toggle-btn"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 'var(--font-xl)', letterSpacing: '-0.02em' }}>
          AttendEase
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            aria-label="View notifications"
            id="notification-bell-btn"
          >
            <FiBell size={20} />
          </button>

          {showNotifications && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: '300px' }}>
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Notifications</h4>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>
                <FiBell size={28} color="var(--text-muted)" style={{ margin: '0 auto var(--space-2)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>No new notifications</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginTop: 'var(--space-1)' }}>
                  You're all caught up!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            className="flex items-center gap-3"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}
            aria-label="Profile menu"
            id="profile-menu-btn"
          >
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{user?.role}</span>
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '0', 
              background: '#0a0a0a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 900, fontSize: 'var(--font-sm)',
              boxShadow: '0 0 10px rgba(204, 255, 0, 0.2)'
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <FiChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform var(--transition-fast)', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu" style={{ right: 0, minWidth: '200px' }}>
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button
                className="dropdown-item"
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
              >
                <FiSettings size={16} /> Settings
              </button>
              <div style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="dropdown-item"
                  onClick={handleLogout}
                  style={{ color: 'var(--danger)' }}
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
