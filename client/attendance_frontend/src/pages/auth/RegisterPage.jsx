import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { AuroraBackground } from '../../components/ui/AuroraBackground';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { Sparkles, UserPlus, ShieldCheck, Mail, Lock, UserCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCapture = async (base64Image) => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in your details before setting up face ID');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Instantly load AI model to verify a face even exists in the frame
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      const img = new Image();
      img.src = base64Image;
      await new Promise(resolve => img.onload = resolve);
      
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
      if (!detections) {
        toast.error("We couldn't detect a face. Please make sure you're in a well-lit area.");
        setIsLoading(false);
        return;
      }

      // 2. Face found! Create payload
      const payload = {
        ...formData,
        faceImage: base64Image
      };

      await api.post('/auth/register', payload);
      toast.success('Welcome aboard! You can now log in.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong during registration';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuroraBackground className="flex items-center justify-center p-6 md:p-10 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
        
        <MagicCard className="p-10 md:p-14" gradientColor="rgba(99, 102, 241, 0.1)">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <UserPlus size={12} className="animate-pulse" />
              Join AttendEase
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 antialiased">
              Create Account
            </h1>
            <p className="text-slate-400 text-lg font-bold tracking-tight antialiased">
              Let's get you set up with your secure profile.
            </p>
          </div>

          <form className="space-y-8" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner" 
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your Role</label>
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all hover:bg-black/60 shadow-inner cursor-pointer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={isLoading}
                >
                  <option value="Student" className="bg-slate-950">Student</option>
                  <option value="Teacher" className="bg-slate-950">Teacher</option>
                  <option value="Admin" className="bg-slate-950">Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner" 
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all hover:bg-black/60 shadow-inner" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 block mb-4">Set up Face ID (required)</label>
              <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group">
                <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
                <div className="absolute inset-0 pointer-events-none border-[1rem] border-black/20" />
              </div>
              <div className="flex items-start gap-3 mt-6 px-4">
                <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed antialiased">
                  This photo will be used as your secure authentication profile. Please make sure your face is clearly visible and well-lit.
                </p>
              </div>
            </div>
          </form>

          <footer className="mt-14 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-bold antialiased">
              Already a member? 
              <Link to="/login" className="text-white hover:text-indigo-400 transition-colors ml-2 inline-flex items-center gap-1 group">
                Login here <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </footer>
        </MagicCard>
      </motion.div>
    </AuroraBackground>
  );
}
