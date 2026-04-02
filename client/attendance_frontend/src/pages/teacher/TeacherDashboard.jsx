import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, PlayCircle, StopCircle, BookOpen, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyLectures = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lectures/my-today');
      setLectures(res.data.data);
    } catch (err) {
      toast.error('Failed to load today\'s lectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLectures();
  }, []);

  const handleShiftChange = async (lectureId, newStatus) => {
    try {
      await api.post('/attendance/teacher/shift', {
        lectureId,
        status: newStatus
      });
      toast.success(`Session ${newStatus === 'Active' ? 'started' : 'ended'} successfully`);
      fetchMyLectures();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update session status';
      toast.error(msg);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:p-10 w-full max-w-7xl relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 mb-12 border-b border-white/10 pb-8 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Instructor Uplink Active
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Welcome, Prof. {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-lg font-medium">Control panel for orchestrating biomatric attendance matrices.</p>
        </div>
      </motion.div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="text-emerald-400" size={20} /> Today's Orchestrations
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="h-[220px] rounded-[2rem] bg-slate-900/50 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center p-16 rounded-[2rem] border border-white/5 bg-gradient-to-b from-slate-900/50 to-black/50 backdrop-blur-3xl text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
              <BookOpen size={32} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Matrix Protocol Inactive</h3>
            <p className="text-slate-400 max-w-md">No orchestrated sessions detected for today's timeline.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {lectures.map((lecture) => (
              <motion.div 
                key={lecture._id} 
                variants={cardVariants}
                className="group relative flex flex-col p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-emerald-500/30 transition-colors shadow-2xl hover:bg-slate-950/80 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${lecture.sessionStatus === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 
                      lecture.sessionStatus === 'Ended' ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}
                  `}>
                    {lecture.sessionStatus === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {lecture.sessionStatus}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                    <Clock size={14} className="text-emerald-400" /> {lecture.startTime} - {lecture.endTime}
                  </div>
                </div>

                <div className="relative z-10 mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-100 transition-colors">
                    {lecture.subject.name} <span className="text-slate-500 font-medium text-lg">({lecture.subject.code})</span>
                  </h3>
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><BookOpen size={14} /> Sector {lecture.division}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>Coordinates TBA</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-4 w-full relative z-10 pt-4 border-t border-white/5">
                  {lecture.sessionStatus === 'Scheduled' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Active')}
                      className="flex-1 overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <PlayCircle size={18} /> Initiate Protocol
                    </button>
                  )}
                  {lecture.sessionStatus === 'Active' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Ended')}
                      className="flex-1 overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                    >
                      <StopCircle size={18} /> Terminate & Lock Matrix
                    </button>
                  )}
                  {lecture.sessionStatus === 'Ended' && (
                    <button 
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed"
                    >
                      <AlertCircle size={18} /> Session Matrix Closed
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none rounded-full" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-shrink-0 items-center justify-center">
            <Info size={24} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Protocol Directives</h3>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              <li className="flex gap-2 items-start"><span className="text-cyan-400 mt-0.5">•</span> Initialize the protocol when actively located in the designated sector (classroom).</li>
              <li className="flex gap-2 items-start"><span className="text-cyan-400 mt-0.5">•</span> Awaiting nodes (students) will receive network access to initiate biometric scanning.</li>
              <li className="flex gap-2 items-start"><span className="text-cyan-400 mt-0.5">•</span> Terminate protocol upon sector exit. Unregistered nodes will default to Absent logs.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
