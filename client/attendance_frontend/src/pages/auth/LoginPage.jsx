import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, Mail, Sparkles, UserCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { AuroraBackground } from '../../components/ui/AuroraBackground';
import { MagicCard } from '../../components/ui/MagicCard';
import { ShimmerButton } from '../../components/ui/ShimmerButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCapture = async (base64Image) => {
    if (!email || !password) {
      alert("Please enter your email and password first.");
      return;
    }

    setIsLoading(true);
    try {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      const img = new Image();
      img.src = base64Image;
      await new Promise(resolve => img.onload = resolve);
      
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
      if (!detections) {
        throw new Error("We couldn't see your face clearly. Please make sure your face is visible to the camera.");
      }

      const user = await login(email, password, base64Image);
      if (user.role === 'Student') navigate('/student');
      else if (user.role === 'Teacher') navigate('/teacher');
      else if (user.role === 'Admin') navigate('/admin');
    } catch (error) {
      // toast runs in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <AuroraBackground className="flex items-center justify-center p-6 md:p-10 min-h-screen">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[550px] relative z-10"
      >
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <MagicCard className="p-10 md:p-14" gradientColor="rgba(34, 211, 238, 0.1)">
          <div className="text-center mb-12">
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Zap size={12} className="animate-pulse" />
              Secure Login
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 antialiased">
              Welcome Back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-lg font-bold tracking-tight antialiased max-w-sm mx-auto">
              Welcome back! Let's get you signed in and verified.
            </motion.p>
          </div>

          <form className="space-y-8" onSubmit={e => e.preventDefault()}>
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all hover:bg-black/60 shadow-inner" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   Verify & Login
                </label>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded border border-emerald-400/10">
                  <Fingerprint size={10} className="animate-pulse" /> Live Scan
                </div>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group">
                <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
                <div className="absolute inset-0 pointer-events-none border-[1rem] border-black/20" />
              </div>
            </motion.div>
          </form>

          <motion.footer variants={itemVariants} className="mt-14 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-bold antialiased">
              New to the system? 
              <Link to="/register" className="text-white hover:text-cyan-400 transition-colors ml-2 inline-flex items-center gap-1 group">
                Create an account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </motion.footer>
        </MagicCard>
      </motion.div>
    </AuroraBackground>
  );
}
