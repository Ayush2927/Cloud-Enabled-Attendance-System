import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, PlayCircle, StopCircle, BookOpen, AlertCircle, Info, Sparkles, Users, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

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
      toast.error('Could not load today\'s classes');
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
      toast.success(`Class ${newStatus === 'Active' ? 'started' : 'ended'} successfully`);
      fetchMyLectures();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update class status';
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
            Ready to Teach
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Welcome, Prof. {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Manage your classes and take biometric attendance with ease from your dashboard.
          </p>
        </div>
      </motion.div>

      <div className="mb-14">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
             <Clock className="text-emerald-400" size={28} /> Your Classes Today
          </h2>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
          <div className="text-slate-500 text-sm font-bold flex items-center gap-2 uppercase tracking-widest opacity-60">
             Live Updates
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2].map(i => (
              <div key={i} className="h-64 rounded-[3rem] bg-white/5 border border-white/5 animate-pulse shadow-2xl" />
            ))}
          </div>
        ) : lectures.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center p-20 rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-3xl text-center shadow-2xl shadow-black/80"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
              <BookOpen size={40} className="text-slate-500 opacity-50" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Looking Clear!</h3>
            <p className="text-slate-500 text-lg font-bold max-w-md antialiased">
              No classes are scheduled for you today. Enjoy your time off!
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {lectures.map((lecture) => (
              <motion.div key={lecture._id} variants={cardVariants}>
                <MagicCard 
                  className="p-8 group"
                  gradientColor={lecture.sessionStatus === 'Active' ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500",
                      lecture.sessionStatus === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-emerald-400/10' : 
                        lecture.sessionStatus === 'Ended' ? 'bg-slate-900 text-slate-500 border-white/5' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    )}>
                      {lecture.sessionStatus === 'Active' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                      {lecture.sessionStatus === 'Active' ? 'Happening Now' : lecture.sessionStatus}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-black bg-black/40 px-4 py-2 rounded-xl border border-white/5 tracking-tighter antialiased">
                      <Clock size={14} className="text-emerald-400" /> {lecture.startTime} - {lecture.endTime}
                    </div>
                  </div>

                  <div className="relative z-10 mb-10 h-28 flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white mb-2 leading-tight tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">
                      {lecture.subject.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-bold tracking-tight">
                      <Users size={16} className="text-slate-600" />
                      Division {lecture.division} <span className="text-slate-700 mx-2">|</span> {lecture.subject.code}
                    </div>
                  </div>

                  <div className="mt-auto flex gap-4 w-full relative z-10 pt-6 border-t border-white/5">
                    {lecture.sessionStatus === 'Scheduled' && (
                      <ShimmerButton 
                        onClick={() => handleShiftChange(lecture._id, 'Active')}
                        className="flex-1 bg-white text-black font-black uppercase tracking-[0.1em] text-xs h-14"
                        shimmerColor="rgba(255, 255, 255, 0.4)"
                        borderRadius="1.5rem"
                      >
                        <PlayCircle size={18} /> Start Class
                      </ShimmerButton>
                    )}
                    {lecture.sessionStatus === 'Active' && (
                      <ShimmerButton 
                        onClick={() => handleShiftChange(lecture._id, 'Ended')}
                        className="flex-1 bg-rose-500 text-white font-black uppercase tracking-[0.1em] text-xs h-14"
                        shimmerColor="rgba(255, 255, 255, 0.2)"
                        borderRadius="1.5rem"
                      >
                        <StopCircle size={18} /> End Class
                      </ShimmerButton>
                    )}
                    {lecture.sessionStatus === 'Ended' && (
                      <div className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-slate-500 font-bold rounded-[1.5rem] cursor-not-allowed text-xs transition-all uppercase tracking-widest opacity-60 h-14">
                        <AlertCircle size={18} /> Class Completed
                      </div>
                    )}
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/5 p-10 md:p-14 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none rounded-full" />
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
            <Info size={32} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Quick Tips</h3>
            <ul className="space-y-4 text-slate-400 font-bold text-sm leading-relaxed antialiased">
              <li className="flex gap-4 items-start"><span className="w-6 h-6 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 text-[10px] flex-shrink-0 mt-0.5 border border-cyan-400/20">1</span> Start your class session as soon as you enter the classroom to allow students to mark their attendance.</li>
              <li className="flex gap-4 items-start"><span className="w-6 h-6 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 text-[10px] flex-shrink-0 mt-0.5 border border-cyan-400/20">2</span> Don't forget to end the session once the class is over to finalize the attendance records.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
