import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Settings, LogOut, ChevronDown, CheckCircle2, User, Layout, HelpCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl px-8 md:px-12">
      <div className="flex items-center gap-8">
        <button
          className="p-3.5 rounded-2xl hover:bg-white/5 text-white transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/10 shadow-2xl shadow-black/20 group"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={22} className="text-slate-400 group-hover:text-white transition-colors" />
        </button>
        <Link to="/" className="text-2xl font-black tracking-tighter text-white hover:text-cyan-400 transition-all flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center p-1 group-hover:rotate-12 transition-transform duration-500">
             <div className="w-full h-full bg-black rounded-[4px]" />
          </div>
          AttendEase
        </Link>
      </div>

      <div className="flex items-center gap-8">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative hidden md:block">
          <button
            className={`p-3.5 rounded-2xl transition-all duration-300 relative border group ${showNotifications ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-400 hover:text-white'}`}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
          >
            <Bell size={22} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-cyan-500 ring-4 ring-black/50 animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-4 w-96 rounded-[2.5rem] border border-white/10 bg-black/90 backdrop-blur-3xl p-4 shadow-2xl shadow-black/80 ring-1 ring-white/10 overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Latest Updates</h4>
                  <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">Mark all as read</button>
                </div>
                <div className="px-8 py-16 text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-white text-xl font-black tracking-tight uppercase antialiased">You're all set!</p>
                  <p className="text-slate-500 text-sm font-bold mt-2 leading-relaxed max-w-[200px] mx-auto antialiased">There are no new attendance activities to report right now.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            className={`flex items-center gap-5 p-2 pr-5 rounded-[1.5rem] transition-all duration-300 border ${showProfileMenu ? 'bg-white/10 border-white/20 shadow-2xl shadow-cyan-500/5' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'}`}
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-base font-black text-black shadow-2xl shadow-cyan-500/10 transition-transform group-hover:scale-105">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-black text-white leading-tight uppercase tracking-tight antialiased">{user?.name?.split(' ')[0]}</span>
              <span className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.2em] mt-0.5 opacity-80">{user?.role}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className="absolute right-0 mt-4 w-72 rounded-[2.5rem] border border-white/10 bg-black/90 backdrop-blur-3xl p-3 shadow-2xl shadow-black/80 ring-1 ring-white/10 overflow-hidden"
              >
                <div className="px-6 py-6 border-b border-white/5 mb-3 bg-white/[0.03] rounded-[1.5rem]">
                  <div className="text-sm font-black text-white tracking-tight uppercase antialiased">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-1 font-bold tracking-tight opacity-80">{user?.email}</div>
                </div>
                <div className="space-y-1">
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all group uppercase tracking-tight"
                    onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                  >
                    <Settings size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" /> Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all group uppercase tracking-tight"
                    onClick={() => { setShowProfileMenu(false); navigate('/help'); }}
                  >
                    <HelpCircle size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" /> Support
                  </button>
                </div>
                <div className="my-2 mx-4 border-t border-white/5" />
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all group uppercase tracking-tight mb-1"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="text-rose-600 group-hover:text-rose-500 transition-colors" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
