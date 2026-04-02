import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { Fingerprint, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCapture = async (base64Image) => {
    if (!email || !password) {
      alert("Please enter email and password first.");
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
        throw new Error("No face detected in the webcam frame. Please look at the camera.");
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
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center p-4">
      {/* 21st.dev Aurora Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, -40, 0], y: [0, -50, 50, 0], scale: [1, 1.1, 0.9, 1] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/30 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 50, 0], y: [0, 50, -30, 0], scale: [1, 1.2, 0.8, 1] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/20 blur-[150px]" 
        />
      </div>

      {/* Main Glass Panel */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px] z-10"
      >
        <div className="rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl border border-white/10 p-8 shadow-2xl shadow-black/80 ring-1 ring-white/5 relative overflow-hidden">
          
          {/* Shine effect inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 pointer-events-none transition-opacity duration-500 hover:opacity-100" />

          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,211,238,0.4)] relative">
              <div className="absolute inset-[2px] rounded-xl bg-black flex items-center justify-center">
                <Fingerprint className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-emerald-300 w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AttendEase</h1>
            <p className="text-slate-400 text-sm text-center px-4">Biometric authentication required to access the central attendance matrix.</p>
          </motion.div>

          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Identity Node</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-medium" 
                  placeholder="you@college.edu" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-medium" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <div className="flex items-center justify-between mb-3 ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bio-Scan Uplink</label>
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm font-medium text-slate-500">
            Unregistered Entity? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-1 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-400">Request Clearance</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
