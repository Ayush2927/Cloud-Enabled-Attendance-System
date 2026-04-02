import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiCheckSquare, FiPieChart, 
  FiBook, FiUsers, FiClock, FiSettings, FiX 
} from 'react-icons/fi';

export default function Sidebar({ userRole, isOpen, onClose }) {
  const navLinks = {
    Student: [
      { path: '/student', name: 'Dashboard', icon: <FiHome /> },
      { path: '/student/mark-attendance', name: 'Mark Attendance', icon: <FiCheckSquare /> },
      { path: '/student/stats', name: 'My Stats', icon: <FiPieChart /> },
    ],
    Teacher: [
      { path: '/teacher', name: 'Dashboard & Sessions', icon: <FiClock /> },
    ],
    Admin: [
      { path: '/admin', name: 'Dashboard', icon: <FiHome /> },
      { path: '/admin/subjects', name: 'Manage Subjects', icon: <FiBook /> },
      { path: '/admin/lectures', name: 'Manage Lectures', icon: <FiClock /> },
      { path: '/admin/logs', name: 'System Logs', icon: <FiUsers /> },
    ]
  };

  const currentLinks = navLinks[userRole] || [];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile close button */}
      <div className="sidebar-mobile-header">
        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--accent)' }}>AttendEase</span>
        <button className="btn-icon" onClick={onClose} aria-label="Close sidebar">
          <FiX size={20} />
        </button>
      </div>

      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
        Menu
      </div>
      
      {currentLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path.split('/').length <= 2}
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-light)' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            textDecoration: 'none',
            transition: 'all var(--transition-fast)'
          })}
        >
          {link.icon}
          {link.name}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto' }}>
        <NavLink
          to="/settings"
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-light)' : 'transparent',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)'
          })}
        >
          <FiSettings /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
