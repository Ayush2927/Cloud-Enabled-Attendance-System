import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PieChart, AlertTriangle, BookOpen, Fingerprint } from 'lucide-react';

export default function MyStats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/attendance/my-stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load attendance statistics');
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
    <div className="container mx-auto px-4 py-8 md:p-10 w-full max-w-7xl relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-12 border-b border-white/10 pb-8 relative"
      >
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            Biometric Data Synced
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Attendance Log
          </h1>
          <p className="text-slate-400 text-lg font-medium">Detailed temporal analysis of your presence across matrices.</p>
        </div>
      </motion.div>

      {/* Aggregate Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div variants={itemVariants} className="relative flex flex-col p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center mb-4 ring-1 ring-white/5">
            <PieChart className="text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Matrix Upload</div>
          <div className={`text-5xl font-extrabold tracking-tight ${overallPercentage >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
            {overallPercentage}%
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="relative flex flex-col p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-center mb-4 ring-1 ring-white/5">
            <AlertTriangle className="text-amber-400" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nodes At Risk</div>
          <div className="text-5xl font-extrabold tracking-tight text-white">
            {stats.filter(s => s.status === 'at-risk').length}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="relative flex flex-col p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-400/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center mb-4 ring-1 ring-white/5">
            <BookOpen className="text-indigo-400" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Node Initiations</div>
          <div className="text-5xl font-extrabold tracking-tight text-white">
            {stats.reduce((acc, curr) => acc + curr.total, 0)}
          </div>
        </motion.div>
      </motion.div>

      {/* Detailed Analysis Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-6 text-white text-xl font-bold">
          <Fingerprint className="text-fuchsia-400" size={20} /> Matrix Breakdown
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-2">Module Protocol</th>
                <th className="py-4 px-2">Verification Ratio</th>
                <th className="py-4 px-2">Completion Rate</th>
                <th className="py-4 px-2">Status Node</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-fuchsia-400 animate-pulse font-medium">
                      <div className="w-4 h-4 rounded-full border-2 border-fuchsia-400 border-t-transparent animate-spin" /> Fetching Logs...
                    </div>
                  </td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-500 font-medium">No biometric records established yet.</td>
                </tr>
              ) : (
                stats.map((stat) => (
                  <tr key={stat.subjectId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-bold text-white text-base">{stat.subjectName}</div>
                      <div className="text-xs text-slate-500 font-medium">{stat.subjectCode}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1 font-bold text-slate-300">
                        <span className="text-cyan-400">{stat.attended}</span>
                        <span className="text-slate-600">/</span>
                        <span>{stat.total}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3 w-48">
                        <span className="text-sm font-bold text-white w-10">{stat.percentage}%</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${stat.percentage >= 75 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                        stat.status === 'safe' 
                          ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                          : 'bg-red-400/10 border-red-400/20 text-red-400'
                      }`}>
                        {stat.status === 'safe' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {stat.status === 'safe' ? 'SECURE' : 'CRITICAL'}
                      </div>
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
