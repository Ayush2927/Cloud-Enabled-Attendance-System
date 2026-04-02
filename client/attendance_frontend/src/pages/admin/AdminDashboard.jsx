import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock, Activity, ArrowRight, Server, Archive } from 'lucide-react';
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
    { label: 'Total Modules', value: stats.totalSubjects, icon: <BookOpen className="text-indigo-400" />, glowColor: "rgba(99, 102, 241, 0.2)", bg: 'bg-indigo-400/10' },
    { label: 'Total Instances', value: stats.totalLectures, icon: <Clock className="text-cyan-400" />, glowColor: "rgba(34, 211, 238, 0.2)", bg: 'bg-cyan-400/10' },
    { label: 'Active Protocols', value: stats.activeSessions, icon: <Activity className="text-emerald-400" />, glowColor: "rgba(52, 211, 153, 0.2)", bg: 'bg-emerald-400/10' },
    { label: 'Closed Matrices', value: stats.endedSessions, icon: <Archive className="text-amber-400" />, glowColor: "rgba(251, 191, 36, 0.2)", bg: 'bg-amber-400/10' },
  ];

  const quickActions = [
    { label: 'Module Engine', description: 'Configure academic curriculums', path: '/admin/subjects', icon: <BookOpen size={20} className="text-indigo-400" /> },
    { label: 'Temporal Scheduler', description: 'Assign instructors to matrices', path: '/admin/lectures', icon: <Clock size={20} className="text-cyan-400" /> },
    { label: 'System Logs', description: 'Audit bio-recognition anomalies', path: '/admin/logs', icon: <Users size={20} className="text-emerald-400" /> },
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
    <div className="container mx-auto px-4 py-8 md:p-10 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={20} />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-12 border-b border-white/10 pb-8 relative"
      >
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Root Access Verified
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            System Overseer ({user?.name.split(' ')[0]})
          </h1>
          <p className="text-slate-400 text-lg font-medium">Global infrastructure and temporal state management.</p>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
      >
        {statCards.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <MagicCard 
              className={cn("p-6", isLoading && "animate-pulse")}
              gradientColor={stat.glowColor}
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 ring-1 ring-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                {stat.icon}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
            </MagicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Core Functions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-indigo-400" size={20} /> Core Directives
        </h2>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <ShimmerButton
                className="w-full justify-start h-auto p-0 border-none bg-transparent"
                onClick={() => navigate(action.path)}
                borderRadius="2rem"
              >
                <div className="w-full flex flex-col items-start p-6 bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem] text-left">
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="text-white/30" />
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    {action.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-100 transition-colors uppercase tracking-tight">{action.label}</h3>
                  <p className="text-sm font-medium text-slate-400 max-w-[80%] normal-case">{action.description}</p>
                </div>
              </ShimmerButton>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
