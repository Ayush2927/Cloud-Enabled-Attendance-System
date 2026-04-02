import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock, Activity, ArrowRight, Server, Archive, ShieldCheck, LayoutDashboard, Database, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSubjects: '—',
    totalLectures: '—',
    activeSessions: '—',
    endedSessions: '—'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjectsRes, lecturesRes] = await Promise.all([
          api.get('/subjects/all'),
          api.get('/lectures/all')
        ]);

        const subjects = subjectsRes.data.data || [];
        const lectures = lecturesRes.data.data || [];
        const active = lectures.filter(l => l.sessionStatus === 'Active').length;
        const ended = lectures.filter(l => l.sessionStatus === 'Ended').length;

        setStats({
          totalSubjects: subjects.length,
          totalLectures: lectures.length,
          activeSessions: active,
          endedSessions: ended
        });
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Subjects', value: stats.totalSubjects, icon: <BookOpen className="text-indigo-400" size={28} />, glowColor: "rgba(99, 102, 241, 0.2)", bg: 'bg-indigo-400/10' },
    { label: 'Total Classes', value: stats.totalLectures, icon: <Clock className="text-cyan-400" size={28} />, glowColor: "rgba(34, 211, 238, 0.2)", bg: 'bg-cyan-400/10' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: <Activity className="text-emerald-400" size={28} />, glowColor: "rgba(52, 211, 153, 0.2)", bg: 'bg-emerald-400/10' },
    { label: 'Completed', value: stats.endedSessions, icon: <Archive className="text-rose-400" size={28} />, glowColor: "rgba(244, 63, 94, 0.2)", bg: 'bg-rose-400/10' },
  ];

  const quickActions = [
    { label: 'Manage Subjects', description: 'Create and organize your academic course list', path: '/admin/subjects', icon: <BookOpen size={24} className="text-indigo-400" /> },
    { label: 'Class Timetable', description: 'Schedule and assign classes to your professors', path: '/admin/lectures', icon: <Clock size={24} className="text-cyan-400" /> },
    { label: 'Activity Logs', description: 'Review system history and attendance records', path: '/admin/logs', icon: <Users size={24} className="text-emerald-400" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(5px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={20} />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-20 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <ShieldCheck size={12} className="animate-pulse" />
            Secure Admin Access
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Admin Overview
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Welcome back, {user?.name.split(' ')[0]}. Here's the current state of your institution's digital infrastructure.
          </p>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
      >
        {statCards.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <MagicCard 
              className={cn("p-8 group", isLoading && "animate-pulse")}
              gradientColor={stat.glowColor}
            >
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center mb-8 border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                {stat.icon}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-5xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">{stat.value}</div>
            </MagicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Links Functions */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
             <LayoutDashboard className="text-indigo-400" size={28} /> Quick Actions
          </h2>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
          <div className="text-slate-500 text-sm font-bold flex items-center gap-2 uppercase tracking-widest opacity-60">
             System Control
          </div>
        </div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <ShimmerButton
                className="w-full justify-start h-auto p-0 border-none bg-transparent group"
                onClick={() => navigate(action.path)}
                borderRadius="3rem"
              >
                <div className="w-full flex flex-col items-start p-10 bg-white/5 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[3rem] text-left transition-all group-hover:bg-white/[0.08] relative overflow-hidden group">
                  {/* Subtle decorative glow */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div className="absolute right-10 top-10 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <ArrowRight className="text-white/40" />
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 shadow-inner group-hover:shadow-indigo-500/20">
                    {action.icon}
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight antialiased">{action.label}</h3>
                  <p className="text-sm font-bold text-slate-500 max-w-[90%] leading-relaxed tracking-tight group-hover:text-slate-300 transition-colors">{action.description}</p>
                </div>
              </ShimmerButton>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* System Status footer tip */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-6 py-10"
      >
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest antialiased">
          <Database size={12} className="text-indigo-400/40" /> Database Online
        </div>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest antialiased">
          <Terminal size={12} className="text-cyan-400/40" /> System Protocols Active
        </div>
      </motion.div>
    </div>
  );
}
