import { NavLink } from 'react-router-dom';
import { 
  Home, CheckSquare, PieChart, 
  BookOpen, Users, Clock, Settings, X 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ userRole, isOpen, onClose }) {
  const navLinks = {
    Student: [
      { path: '/student', name: 'Dashboard', icon: <Home size={18} /> },
      { path: '/student/mark-attendance', name: 'Mark Attendance', icon: <CheckSquare size={18} /> },
      { path: '/student/stats', name: 'My Stats', icon: <PieChart size={18} /> },
    ],
    Teacher: [
      { path: '/teacher', name: 'Dashboard & Sessions', icon: <Clock size={18} /> },
    ],
    Admin: [
      { path: '/admin', name: 'Dashboard', icon: <Home size={18} /> },
      { path: '/admin/subjects', name: 'Manage Subjects', icon: <BookOpen size={18} /> },
      { path: '/admin/lectures', name: 'Manage Lectures', icon: <Clock size={18} /> },
      { path: '/admin/logs', name: 'System Logs', icon: <Users size={18} /> },
    ]
  };

  const currentLinks = navLinks[userRole] || [];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''} bg-black/40 backdrop-blur-2xl border-r border-white/10`}>
      {/* Mobile close button */}
      <div className="sidebar-mobile-header flex items-center justify-between pb-6 mb-4 border-b border-white/10">
        <span className="text-sm font-bold text-cyan-400 tracking-wide">AttendEase</span>
        <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 mb-3">
        Navigation Map
      </div>
      
      <div className="flex flex-col gap-1 w-full">
        {currentLinks.map((link, idx) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path.split('/').length <= 2}
            onClick={onClose}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden group
              ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <span className={`transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400/70'}`}>
                    {link.icon}
                  </span>
                  <span className={`text-sm font-medium ${isActive ? 'font-semibold tracking-wide' : ''}`}>
                    {link.name}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => `
            relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden group
            ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <span className={`transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400/70'}`}>
                  <Settings size={18} />
                </span>
                <span className={`text-sm font-medium ${isActive ? 'font-semibold tracking-wide' : ''}`}>
                  Settings
                </span>
              </div>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
