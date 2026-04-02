import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, ScanFace, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebcamCapture({ onCapture, isLoading }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Start the webcam
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. Please enable permissions.');
    }
  };

  // Stop the webcam tracks
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Attach stream to video element
  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ring-1 ring-white/5">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex h-full w-full items-center justify-center p-6 text-center text-red-400"
          >
            {error}
          </motion.div>
        ) : !cameraActive ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-black to-slate-900"
          >
            <div className="relative">
              <ScanFace className="h-16 w-16 text-white/20" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl"
              />
            </div>
            <button 
              type="button" 
              onClick={startCamera} 
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 transition-opacity group-hover:opacity-20" />
              <Camera size={18} /> Initialize Scanner
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative h-full w-full"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
            
            {/* Cybernetic Scanner Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner Reticles */}
              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-cyan-400" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-cyan-400" />
              
              {/* Sweeping Laser Line */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
              />
              
              {/* Optional Subtle Grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button 
                type="button" 
                onClick={captureFrame} 
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-black/50 px-8 py-3 text-sm font-semibold text-white backdrop-blur-xl border border-white/20 transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Analyzing Face...
                  </>
                ) : (
                  <>
                    <ScanFace size={18} className="transition-colors group-hover:text-black text-cyan-400" /> Capture & Login
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
