import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, PlusCircle, LayoutDashboard, Sparkles, GraduationCap, Layers, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Meteors } from '../../components/ui/Meteors';
import { cn } from '../../lib/utils';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', semester: 1 });

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/subjects/all');
      setSubjects(res.data.data);
    } catch (err) {
      toast.error('Could not load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects/create', newSubject);
      toast.success('Subject added successfully!');
      setNewSubject({ name: '', code: '', semester: 1 });
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subject');
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
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="animate-pulse" />
            Curriculum Builder
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            Subjects & Courses
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Organize and manage your institution's academic subjects. Create a structured learning path for your students.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Create Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-5"
        >
          <MagicCard className="p-10" gradientColor="rgba(99, 102, 241, 0.1)">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase">
              <PlusCircle className="text-indigo-400" size={24} /> New Subject
            </h2>
            
            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Course Code</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner placeholder:text-slate-700 uppercase" 
                  placeholder="e.g. CS101" 
                  value={newSubject.code} 
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Course Title</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner placeholder:text-slate-700" 
                  placeholder="e.g. Cloud Computing" 
                  value={newSubject.name} 
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Semester</label>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner [color-scheme:dark]" 
                  min="1" max="8" 
                  value={newSubject.semester} 
                  onChange={e => setNewSubject({...newSubject, semester: e.target.value})} 
                  required 
                />
              </div>

              <ShimmerButton 
                type="submit" 
                className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.1em] text-xs shadow-2xl"
                shimmerColor="rgba(255, 255, 255, 0.4)"
                borderRadius="1.5rem"
              >
                Add Subject
              </ShimmerButton>
            </form>
          </MagicCard>
        </motion.div>

        {/* Course List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-7"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight uppercase">
              <Layers className="text-indigo-400" size={28} /> Active Subjects
            </h2>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-60">
              {subjects.length} Total Registered
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-28 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-16 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-3xl text-center shadow-2xl shadow-black/40"
              >
                <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/10 mx-auto shadow-2xl">
                  <GraduationCap size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No subjects found</h3>
                <p className="text-slate-500 text-sm font-bold antialiased">Start by adding your first academic course above.</p>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4">
                {subjects.map(sub => (
                  <motion.div 
                    key={sub._id} 
                    variants={itemVariants}
                    layout
                    className="group relative flex items-center justify-between p-6 bg-white/5 hover:bg-white/[0.08] backdrop-blur-3xl border border-white/5 rounded-3xl transition-all duration-300 shadow-2xl shadow-black/20"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 transition-transform duration-500 group-hover:scale-110 shadow-2xl shadow-indigo-500/10">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="text-xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">
                          {sub.name}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase antialiased">
                            {sub.code}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase antialiased">
                            Semester {sub.semester}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-end">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] antialiased">Staff Members</div>
                        <div className="text-lg font-black text-white tracking-tight">{sub.teachers?.length || 0}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shadow-inner opacity-0 group-hover:opacity-100 duration-300">
                        <Search size={16} className="text-white/40" />
                      </div>
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
