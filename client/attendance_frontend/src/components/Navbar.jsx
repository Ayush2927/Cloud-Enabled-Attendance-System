import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <header className="sticky top-0 z-50 flex h-[70px] items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-2xl px-6">
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
          AttendEase
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 animate-pulse border border-black" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-3xl p-2 shadow-2xl shadow-black ring-1 ring-white/5"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                </div>
                <div className="px-4 py-8 text-center flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell size={24} className="text-slate-500" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">System Matrix Clear</p>
                  <p className="text-slate-500 text-xs mt-1">No pending anomalies detected.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            className="flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
              <span className="text-xs text-cyan-400/80 font-medium">{user?.role}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-black shadow-inner">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-3xl p-1.5 shadow-2xl shadow-black ring-1 ring-white/5"
              >
                <div className="px-3 py-3 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-xl">
                  <div className="text-sm font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                </div>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                >
                  <Settings size={16} /> User Config
                </button>
                <div className="my-1 border-t border-white/5" />
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
