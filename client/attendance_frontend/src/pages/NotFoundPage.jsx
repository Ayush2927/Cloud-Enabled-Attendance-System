import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, ArrowLeft, Ghost } from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { Meteors } from '../components/ui/Meteors';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black selection:bg-cyan-500/30">
      <Meteors number={15} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="max-w-xl w-full relative z-10"
      >
        <MagicCard className="p-12 md:p-16 text-center" gradientColor="rgba(244, 63, 94, 0.1)">
          <div className="relative mb-12 flex flex-col items-center">
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-28 h-28 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-2xl mb-8 relative z-10"
            >
              <Ghost size={48} className="drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
            </motion.div>
            
            {/* Background decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/5 blur-[80px] pointer-events-none rounded-full" />
            
            <h1 className="text-7xl font-black tracking-tighter text-white mb-2 uppercase">404</h1>
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.25em] antialiased">Route Not Found</div>
          </div>

          <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase antialiased">Lost in Space?</h2>
          <p className="text-slate-500 text-lg font-bold mb-12 leading-relaxed antialiased">
            It seems like you've taken a wrong turn. Let's get you back to where you need to be.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
             <Link to="/" className="flex-1">
              <ShimmerButton 
                className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] h-14"
                shimmerColor="rgba(255, 255, 255, 0.4)"
                borderRadius="1.5rem"
              >
                <Home size={16} /> Take Me Home
              </ShimmerButton>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] transition-all h-14 group antialiased"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Go Back
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>
        </MagicCard>
      </motion.div>
    </div>
  );
}
