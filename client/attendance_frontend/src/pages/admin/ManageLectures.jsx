import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Calendar, Clock, BookOpen, Users, PlusCircle, LayoutDashboard, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function ManageLectures() {
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '', 
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    division: 'SE-A'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lecRes, subRes] = await Promise.all([
        api.get('/lectures/all'),
        api.get('/subjects/all')
      ]);
      setLectures(lecRes.data.data);
      setSubjects(subRes.data.data);
      if (subRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subRes.data.data[0]._id }));
      }
    } catch (err) {
      toast.error('Could not load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.teacher || formData.teacher.length !== 24) {
        toast.error('Please enter a valid Professor ID (24-char ID)');
        return;
      }
      await api.post('/lectures/create', formData);
      toast.success('Class successfully scheduled!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lectures/${id}`);
      toast.success('Class removed from schedule');
      setLectures(lectures.filter(l => l._id !== id));
    } catch (error) {
      toast.error('Failed to remove class');
    }
  };

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
        className="flex flex-col gap-4 mb-16 relative"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="animate-pulse" />
            Schedule Manager
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Class Timetable
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Organize and assign classes to your professors. Plan your institution's academic timeline with precision.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Creator Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-5"
        >
          <MagicCard className="p-10" gradientColor="rgba(34, 211, 238, 0.1)">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tight">
              <PlusCircle className="text-cyan-400" size={24} /> New Schedule
            </h2>
            
            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Select Subject</label>
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 appearance-none transition-all hover:bg-black/60 shadow-inner"
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                  required
                >
                  <option value="" className="bg-slate-950">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s._id} value={s._id} className="bg-slate-950">{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assign Professor (ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner placeholder:text-slate-700" 
                  placeholder="Enter Professor's 24-char ID..." 
                  value={formData.teacher} 
                  onChange={e => setFormData({...formData, teacher: e.target.value})} 
                  required 
                />
                <div className="text-[10px] text-slate-600 font-bold tracking-tight italic px-1 flex items-center gap-1.5 antialiased">
                  <AlertCircle size={10} /> Enter the database ID for the professor
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Division</label>
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 appearance-none transition-all hover:bg-black/60 shadow-inner"
                    value={formData.division} 
                    onChange={e => setFormData({...formData, division: e.target.value})}
                  >
                    <option className="bg-slate-950">SE-A</option><option className="bg-slate-950">SE-B</option>
                    <option className="bg-slate-950">TE-A</option><option className="bg-slate-950">TE-B</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner [color-scheme:dark]" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner [color-scheme:dark]" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">End Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner [color-scheme:dark]" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <ShimmerButton 
                type="submit" 
                className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.1em] text-xs shadow-2xl"
                shimmerColor="rgba(255, 255, 255, 0.4)"
                borderRadius="1.5rem"
              >
                Schedule Class
              </ShimmerButton>
            </form>
          </MagicCard>
        </motion.div>

        {/* Schedule List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-7"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
              <LayoutDashboard className="text-cyan-400" size={28} /> Dynamic Schedule
            </h2>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-60">
              System Wide Views
            </div>
          </div>
          
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-28 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-16 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-3xl text-center shadow-2xl shadow-black/40"
              >
                <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/10 mx-auto shadow-2xl">
                  <Calendar size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No classes scheduled</h3>
                <p className="text-slate-500 text-sm font-bold antialiased">Use the panel on the left to start building the academic year.</p>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {lectures.map(lec => (
                  <motion.div 
                    key={lec._id} 
                    variants={itemVariants} 
                    layout
                    className="group relative flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] backdrop-blur-3xl border border-white/5 rounded-3xl transition-all duration-300 shadow-2xl shadow-black/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 transition-transform duration-500 group-hover:scale-110 shadow-2xl",
                        lec.sessionStatus === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-900/50 text-slate-500'
                      )}>
                        {lec.sessionStatus === 'Active' ? <Activity size={24} className="animate-pulse" /> : <Clock size={24} />}
                      </div>
                      <div>
                        <div className="text-lg font-black text-white tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
                          {lec.subject?.name} 
                          <span className="text-[10px] font-black text-slate-600 ml-3 tracking-[0.2em]">DIV {lec.division}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-tight uppercase antialiased">
                            <Calendar size={12} className="text-slate-700" /> {new Date(lec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-tight uppercase antialiased">
                            <Clock size={12} className="text-slate-700" /> {lec.startTime} - {lec.endTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={cn(
                        "hidden md:inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl",
                        lec.sessionStatus === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                          lec.sessionStatus === 'Ended' ? 'bg-slate-900 text-slate-600 border-white/5' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      )}>
                        {lec.sessionStatus}
                      </span>
                      <button 
                        onClick={() => handleDelete(lec._id)} 
                        className="w-12 h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all duration-300 shadow-2xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
