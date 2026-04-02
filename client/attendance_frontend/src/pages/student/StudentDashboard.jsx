import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, CheckSquare, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [division, setDivision] = useState('SE-B');
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/lectures/today?division=${division}`);
        setLectures(res.data.data);
      } catch (err) {
        toast.error('Failed to load today\'s timetable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [division]);

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
    <div className="container mx-auto px-4 py-8 md:p-10 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={15} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-between items-end gap-6 mb-12 border-b border-white/10 pb-8 relative"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Live Matrix
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Greetings, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-lg font-medium">Your schedule matrix for today's active cycles.</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3 bg-black/40 border border-white/10 p-1.5 rounded-xl backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3">Sector</span>
          <select 
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-cyan-400/50 appearance-none min-w-[100px] transition-all"
            value={division} 
            onChange={e => setDivision(e.target.value)}
          >
            <option value="SE-A" className="bg-slate-900">SE-A</option>
            <option value="SE-B" className="bg-slate-900">SE-B</option>
            <option value="TE-A" className="bg-slate-900">TE-A</option>
          </select>
        </div>
      </motion.div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Calendar className="text-cyan-400" size={20} /> Assigned Trajectories
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-[250px] rounded-[2rem] bg-slate-900/50 border border-white/5 animate-pulse shadow-2xl" />
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center p-16 rounded-[2rem] border border-white/5 bg-gradient-to-b from-slate-900/50 to-black/50 backdrop-blur-3xl text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
              <Calendar size={32} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">No Active Nodes</h3>
            <p className="text-slate-400 max-w-md">Your schedule matrix is currently clear. Matrix dormancy detected.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lectures.map((lecture) => (
              <motion.div key={lecture._id} variants={cardVariants}>
                <MagicCard 
                  className="p-6"
                  gradientColor={lecture.sessionStatus === 'Active' ? "rgba(34, 211, 238, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`
                      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${lecture.sessionStatus === 'Active' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 
                        lecture.sessionStatus === 'Ended' ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}
                    `}>
                      {lecture.sessionStatus === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                      {lecture.sessionStatus}
                    </div>
                    <div className="flex items-center gap-1.4 text-slate-400 text-xs font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <Clock size={12} className="text-cyan-400 mr-1" /> {lecture.startTime} - {lecture.endTime}
                    </div>
                  </div>

                  <div className="relative z-10 mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight uppercase tracking-tight">
                      {lecture.subject.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                      <span className="flex items-center gap-1.5"><BookOpen size={14} /> Prof. {lecture.teacher.name}</span>
                    </div>
                  </div>

                  <div className="mt-auto relative z-10 pt-4 border-t border-white/5">
                    {lecture.sessionStatus === 'Active' ? (
                      <ShimmerButton 
                        onClick={() => navigate(`/student/mark-attendance/${lecture._id}`)}
                        className="w-full bg-cyan-500/20 border-cyan-500/30 font-bold uppercase tracking-tighter"
                        shimmerColor="#22d3ee"
                        borderRadius="1rem"
                      >
                        <CheckSquare size={18} /> Establish Uplink
                      </ShimmerButton>
                    ) : (
                      <div className="w-full h-12 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/5 text-slate-500 font-bold rounded-2xl cursor-not-allowed text-xs transition-all uppercase tracking-widest">
                        <AlertCircle size={16} /> Matrix {lecture.sessionStatus === 'Scheduled' ? 'Pending' : 'Closed'}
                      </div>
                    )}
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
