import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PieChart, AlertTriangle, BookOpen, CheckCircle2, ListChecks, Info } from 'lucide-react';
import { MagicCard } from '../../components/ui/MagicCard';
import { Meteors } from '../../components/ui/Meteors';

export default function MyStats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/attendance/my-stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Could not load your attendance stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const overallPercentage = stats.length 
    ? Math.round(stats.reduce((acc, curr) => acc + curr.percentage, 0) / stats.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={15} />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-14 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <CheckCircle2 size={12} className="animate-pulse" />
            Data Verified
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
            My Attendance
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Here's a detailed overview of your class participation and current attendance standing.
          </p>
        </div>
      </motion.div>

      {/* Aggregate Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
        <motion.div variants={itemVariants}>
          <MagicCard className="p-8" gradientColor="rgba(34, 211, 238, 0.2)">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl">
              <PieChart className="text-cyan-400" size={28} />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Current Average</div>
            <div className={`text-6xl font-black tracking-tighter ${overallPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overallPercentage}%
            </div>
          </MagicCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <MagicCard className="p-8" gradientColor="rgba(251, 191, 36, 0.2)">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl">
              <AlertTriangle className="text-amber-400" size={28} />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Attention Required</div>
            <div className="text-6xl font-black tracking-tighter text-white">
              {stats.filter(s => s.status === 'at-risk').length}
            </div>
          </MagicCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <MagicCard className="p-8" gradientColor="rgba(99, 102, 241, 0.2)">
            <div className="w-14 h-14 rounded-2xl bg-indigo-400/10 flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl">
              <BookOpen className="text-indigo-400" size={28} />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Classes</div>
            <div className="text-6xl font-black tracking-tighter text-white">
              {stats.reduce((acc, curr) => acc + curr.total, 0)}
            </div>
          </MagicCard>
        </motion.div>
      </motion.div>

      {/* Detailed Analysis Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="flex items-center gap-3 text-white text-2xl font-black tracking-tight">
            <ListChecks className="text-cyan-400" size={24} /> Subject Breakdown
          </h2>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Info size={14} /> Percentage updated in real-time
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="pb-6 px-4">Subject Info</th>
                <th className="pb-6 px-4">Classes Attended</th>
                <th className="pb-6 px-4">Attendance Rank</th>
                <th className="pb-6 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                      <span className="text-slate-500 font-bold text-sm tracking-tight">Loading your data...</span>
                    </div>
                  </td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <p className="text-slate-500 font-bold text-lg">No attendance records found yet.</p>
                  </td>
                </tr>
              ) : (
                stats.map((stat) => (
                  <tr key={stat.subjectId} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.03]">
                    <td className="py-8 px-4">
                      <div className="font-black text-white text-lg tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{stat.subjectName}</div>
                      <div className="text-xs text-slate-500 font-bold tracking-widest mt-1 opacity-60 uppercase">{stat.subjectCode}</div>
                    </td>
                    <td className="py-8 px-4">
                      <div className="flex items-center gap-2 font-black text-white text-xl">
                        <span className="text-cyan-400">{stat.attended}</span>
                        <span className="text-slate-700 text-sm">/</span>
                        <span className="text-slate-400 text-sm">{stat.total}</span>
                      </div>
                    </td>
                    <td className="py-8 px-4">
                      <div className="flex items-center gap-5 w-56">
                        <span className={`text-lg font-black tracking-tighter w-12 ${stat.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stat.percentage}%
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden relative border border-white/5 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`absolute top-0 left-0 h-full rounded-full ${stat.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-4 text-right">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                        stat.status === 'safe' 
                          ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                          : 'bg-rose-400/10 border-rose-400/20 text-rose-400 animate-pulse'
                      }`}>
                        {stat.status === 'safe' ? 'Good Standing' : 'Low Attendance'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
