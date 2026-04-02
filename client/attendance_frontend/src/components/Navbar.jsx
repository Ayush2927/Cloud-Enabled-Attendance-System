import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiBell, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';

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
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="btn-icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
          id="sidebar-toggle-btn"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/" className="brand-mark">
          AttendEase
        </Link>
      </div>

      <div className="navbar-actions">
        {/* Notification Bell */}
        <div ref={notifRef} className="nav-dropdown-wrapper">
          <button
            className="btn-icon"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            aria-label="View notifications"
            id="notification-bell-btn"
          >
            <FiBell size={20} />
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
              </div>
              <div className="dropdown-empty-state">
                <FiBell size={28} />
                <p>No new notifications</p>
                <p className="subtle-text">
                  You're all caught up!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="nav-dropdown-wrapper">
          <button
            className="profile-trigger"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            aria-label="Profile menu"
            id="profile-menu-btn"
          >
            <div className="profile-meta">
              <span>{user?.name}</span>
              <span>{user?.role}</span>
            </div>
            <div className="avatar-chip">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <FiChevronDown className={showProfileMenu ? 'caret-open' : ''} size={14} />
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="dropdown-header">
                <div className="profile-name">{user?.name}</div>
                <div className="subtle-text">{user?.email}</div>
              </div>
              <button
                className="dropdown-item"
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
              >
                <FiSettings size={16} /> Settings
              </button>
              <div className="dropdown-divider">
                <button
                  className="dropdown-item danger-item"
                  onClick={handleLogout}
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
