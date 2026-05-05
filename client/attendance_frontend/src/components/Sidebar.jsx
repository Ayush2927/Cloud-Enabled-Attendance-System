import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiCheckSquare, FiPieChart, 
  FiBook, FiUsers, FiClock, FiSettings
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
    <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-menu-label">
        Menu
      </div>
      
      {currentLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path.split('/').length <= 2}
          onClick={onClose}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          {link.icon}
          {link.name}
        </NavLink>
      ))}

      <div className="sidebar-footer-link">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FiSettings /> Settings
        </NavLink>
      </div>
    </nav>
  );
}
