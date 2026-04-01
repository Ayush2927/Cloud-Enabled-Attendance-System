import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiCheckSquare, FiPieChart, 
  FiBook, FiUsers, FiClock, FiSettings 
} from 'react-icons/fi';

export default function Sidebar({ userRole }) {
  // Navigation Links specific to roles
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
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: 'var(--space-6) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      minHeight: 'calc(100vh - var(--navbar-height))'
    }}>
      <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 'var(--space-4)' }}>
        Menu
      </div>
      
      {currentLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path.split('/').length <= 2}
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
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)', textDecoration: 'none'
          }}
        >
          <FiSettings /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
