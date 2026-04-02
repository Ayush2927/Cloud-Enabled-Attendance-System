import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { History, Search, ShieldCheck, UserCheck, AlertCircle, Clock, Calendar, Sparkles, Filter, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/attendance/admin/all-logs');
        setLogs(res.data.data);
      } catch (err) {
        toast.error('Could not load activity history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={15} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-16 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="animate-pulse" />
            Security Logs
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Activity History
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            A complete record of class attendance and student activity. Monitor system-wide biometric verifications in real-time.
          </p>
        </div>
      </motion.div>

      {/* Audit Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <h2 className="flex items-center gap-4 text-white text-2xl font-black tracking-tight uppercase">
            <History className="text-emerald-400" size={28} /> All Records
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all hover:bg-black/60 shadow-inner min-w-[280px]"
              />
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="pb-6 px-4">Date & Time</th>
                <th className="pb-6 px-4">Student Info</th>
                <th className="pb-6 px-4">Subject & Group</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Verification</th>
                <th className="pb-6 px-4 text-right">Activity</th>
              </tr>
            </thead>
            <AnimatePresence mode="popLayout">
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                        <span className="text-slate-500 font-bold text-sm tracking-tight uppercase">Fetching logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 mx-auto opacity-50">
                        <Database size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-bold text-lg antialiased">No activity records found yet.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <motion.tr 
                      key={log._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.03]"
                    >
                      <td className="py-8 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-black text-sm tracking-tight uppercase">
                            {new Date(log.dateIST).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 opacity-60">
                            {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <div className="font-black text-white text-sm tracking-tighter uppercase">{log.user?.name}</div>
                            <div className="text-[10px] text-slate-500 font-bold tracking-tight opacity-60 antialiased">{log.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-4">
                        <div className="font-black text-white text-sm tracking-tight uppercase">{log.subject?.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1 opacity-60">DIV {log.lecture?.division}</div>
                      </td>
                      <td className="py-8 px-4">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-2xl",
                          log.status === 'Present' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'
                        )}>
                          {log.status === 'Present' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-8 px-4">
                        {log.status === 'Present' ? (
                          log.hasFaceProof ? (
                            <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-400/5 px-3 py-1.5 rounded-lg border border-emerald-400/10">
                              <ShieldCheck size={14} /> Verified
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-400 font-black text-[10px] uppercase tracking-widest bg-amber-400/5 px-3 py-1.5 rounded-lg border border-amber-400/10 animate-pulse">
                              <AlertCircle size={14} /> Manual
                            </div>
                          )
                        ) : (
                          <span className="text-slate-700 font-black text-[10px] uppercase tracking-widest">Absence Logged</span>
                        )}
                      </td>
                      <td className="py-8 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Check Out</span>
                          <span className="text-white font-black text-xs tracking-tight">
                            {log.checkOutIST || "—"}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
