import { NavLink } from 'react-router-dom';
import { 
  Home, CheckSquare, BarChart3, 
  BookOpen, Users, Clock, Settings, X, LayoutDashboard, UserCheck, Calendar, Activity, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ userRole, isOpen, onClose }) {
  const navLinks = {
    Student: [
      { path: '/student', name: 'Overview', icon: <LayoutDashboard size={20} /> },
      { path: '/student/mark-attendance', name: 'Mark My Presence', icon: <UserCheck size={20} /> },
      { path: '/student/stats', name: 'Activity & Stats', icon: <BarChart3 size={20} /> },
    ],
    Teacher: [
      { path: '/teacher', name: 'My Schedule', icon: <Calendar size={20} /> },
    ],
    Admin: [
      { path: '/admin', name: 'System Hub', icon: <LayoutDashboard size={20} /> },
      { path: '/admin/subjects', name: 'Subjects', icon: <BookOpen size={20} /> },
      { path: '/admin/lectures', name: 'Schedule', icon: <Clock size={20} /> },
      { path: '/admin/logs', name: 'Activity Logs', icon: <ShieldCheck size={20} /> },
    ]
  };

  const currentLinks = navLinks[userRole] || [];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'}`}>
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-12 lg:hidden">
        <span className="text-2xl font-black tracking-tighter text-white uppercase">AttendEase</span>
        <button className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] pl-4 mb-6 opacity-80 antialiased">
        Navigation Hub
      </div>
      
      <nav className="flex flex-col gap-3 w-full">
        {currentLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path.split('/').length <= 2}
            onClick={onClose}
            className={({ isActive }) => `
              relative flex items-center gap-5 px-6 py-5 rounded-[1.75rem] transition-all duration-500 group overflow-hidden
              ${isActive ? 'text-white shadow-2xl shadow-cyan-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-white/[0.06] border border-white/5 rounded-[1.75rem] shadow-inner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-5">
                  <span className={`transition-all duration-500 group-hover:scale-110 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'text-slate-600'}`}>
                    {link.icon}
                  </span>
                  <span className={`text-sm font-black tracking-tight uppercase antialiased ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {link.name}
                  </span>
                </div>
                {isActive && (
                   <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute right-6 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                   />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-10 border-t border-white/5 space-y-4">
        <div className="px-6 py-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 mb-4 group cursor-pointer hover:bg-indigo-500/10 transition-colors">
           <div className="flex items-center gap-3 mb-2">
              <Activity size={14} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">System Live</span>
           </div>
           <p className="text-[11px] text-slate-500 font-bold leading-relaxed antialiased">All services are operational and biometric sync is active.</p>
        </div>
        
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => `
            relative flex items-center gap-5 px-6 py-5 rounded-[1.75rem] transition-all duration-500 group
            ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-white/[0.06] border border-white/5 rounded-[1.75rem] shadow-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-5">
                <span className={`transition-all duration-500 group-hover:scale-110 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'text-slate-600'}`}>
                  <Settings size={20} />
                </span>
                <span className={`text-sm font-black tracking-tight uppercase antialiased ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  Preferences
                </span>
              </div>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
