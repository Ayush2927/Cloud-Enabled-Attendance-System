import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, CheckSquare, Calendar, BookOpen, AlertCircle, Sparkles, UserCircle2 } from 'lucide-react';
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
        toast.error('Could not load today\'s schedule');
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
    <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-7xl relative z-10 overflow-hidden min-h-screen">
      <Meteors number={15} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-between items-end gap-8 mb-16 relative"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="animate-pulse" />
            Active Session
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Hi, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Ready for your classes today? Here's what's happening in your division.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-3xl shadow-2xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-4">Division</span>
          <select 
            className="bg-black/40 border border-white/5 rounded-xl py-3 px-6 text-white font-bold cursor-pointer outline-none focus:ring-4 focus:ring-cyan-500/10 appearance-none min-w-[120px] transition-all hover:bg-black/60 tracking-tight"
            value={division} 
            onChange={e => setDivision(e.target.value)}
          >
            <option value="SE-A" className="bg-slate-950">SE-A</option>
            <option value="SE-B" className="bg-slate-950">SE-B</option>
            <option value="TE-A" className="bg-slate-950">TE-A</option>
          </select>
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
            <Calendar className="text-cyan-400" size={28} /> Today's Schedule
          </h2>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
          <div className="text-slate-500 text-sm font-bold flex items-center gap-2">
             <Clock size={16} /> Dynamic Updates
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-80 rounded-[3rem] bg-white/5 border border-white/5 animate-pulse shadow-2xl shadow-black/40" />
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center p-20 rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-3xl text-center shadow-2xl shadow-black/80"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
              <Calendar size={40} className="text-slate-500 opacity-50" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Quiet Day!</h3>
            <p className="text-slate-500 text-lg font-bold max-w-md antialiased">
              No classes are scheduled for today in your division. Enjoy your break!
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {lectures.map((lecture) => (
              <motion.div key={lecture._id} variants={cardVariants}>
                <MagicCard 
                  className="p-8 group"
                  gradientColor={lecture.sessionStatus === 'Active' ? "rgba(34, 211, 238, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500",
                      lecture.sessionStatus === 'Active' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 shadow-cyan-400/10' : 
                        lecture.sessionStatus === 'Ended' ? 'bg-slate-900 text-slate-500 border-white/5' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    )}>
                      {lecture.sessionStatus === 'Active' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                      {lecture.sessionStatus === 'Active' ? 'Happening Now' : lecture.sessionStatus}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-black bg-black/40 px-4 py-2 rounded-xl border border-white/5 tracking-tighter antialiased">
                      <Clock size={14} className="text-cyan-400" /> {lecture.startTime} - {lecture.endTime}
                    </div>
                  </div>

                  <div className="relative z-10 mb-10 h-28 flex flex-col justify-end">
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight tracking-tighter uppercase group-hover:text-cyan-400 transition-colors">
                      {lecture.subject.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold tracking-tight">
                      <UserCircle2 size={16} className="text-slate-600" />
                      Prof. {lecture.teacher.name}
                    </div>
                  </div>

                  <div className="mt-auto relative z-10 pt-6 border-t border-white/5">
                    {lecture.sessionStatus === 'Active' ? (
                      <ShimmerButton 
                        onClick={() => navigate(`/student/mark-attendance/${lecture._id}`)}
                        className="w-full bg-white text-black font-black uppercase tracking-[0.1em] text-xs h-14"
                        shimmerColor="rgba(255, 255, 255, 0.4)"
                        borderRadius="1.5rem"
                      >
                        <CheckSquare size={18} /> Mark Attendance
                      </ShimmerButton>
                    ) : (
                      <div className="w-full h-14 flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-slate-500 font-bold rounded-[1.5rem] cursor-not-allowed text-xs transition-all uppercase tracking-widest opacity-60">
                        <AlertCircle size={18} /> {lecture.sessionStatus === 'Scheduled' ? 'Upcoming' : 'Session Ended'}
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
