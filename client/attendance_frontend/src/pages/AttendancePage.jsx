import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, Smartphone, Zap, AlertCircle, Camera, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { MagicCard } from '../components/ui/MagicCard';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { Meteors } from '../components/ui/Meteors';
import { cn } from '../lib/utils';

// Utility to load AI Models
const loadModels = async () => {
    try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        return true;
    } catch (e) {
        console.error("AI Model Load Error:", e);
        return false;
    }
};

export default function AttendancePage() {
    const { lectureId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Preparing secure environment...');
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!lectureId) {
            toast.error('Invalid session selected.');
            navigate('/student');
            return;
        }

        const init = async () => {
            const loaded = await loadModels();
            setIsModelsLoaded(loaded);
            setStatus(loaded ? 'Ready to confirm your presence' : 'We encountered an error setting up the environment');
        };
        init();
    }, [lectureId, navigate]);

    // Perform actual face matching
    const performFaceMatch = async (referenceBase64, liveBase64) => {
        try {
            const createImage = (b64) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = b64;
                });
            };

            const refImage = await createImage(referenceBase64);
            const liveImage = await createImage(liveBase64);

            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
            const refResults = await faceapi.detectSingleFace(refImage, options).withFaceLandmarks().withFaceDescriptor();
            const liveResults = await faceapi.detectSingleFace(liveImage, options).withFaceLandmarks().withFaceDescriptor();

            if (!refResults) throw new Error("We couldn't find a face in your registered profile photo.");
            if (!liveResults) throw new Error("We couldn't see your face clearly. Please check the lighting.");

            const distance = faceapi.euclideanDistance(refResults.descriptor, liveResults.descriptor);
            return distance < 0.55; 
        } catch (error) {
            throw error;
        }
    };

    const handleCapture = async (liveFaceImage) => {
        if (!isModelsLoaded) {
            toast.error('Still preparing the environment...');
            return;
        }

        setIsLoading(true);
        setStatus('Loading your secure profile...');

        try {
            const response = await api.get('/attendance/get-face');
            const storedFace = response.data.data.faceData;

            setStatus('Verifying your identity... Keep steady.');
            const isMatch = await performFaceMatch(storedFace, liveFaceImage);

            if (isMatch) {
                setStatus('✅ Verified! Recording your attendance...');
                await api.post('/attendance/student/mark', {
                    lectureId,
                    liveFaceImage
                });

                toast.success('Your presence has been recorded!');
                navigate('/student/stats');
            } else {
                setStatus('❌ We couldn\'t confirm it\'s you. Please try again.');
                toast.error('Identity verification failed.');
            }
        } catch (err) {
            const message = err.message || err.response?.data?.message || 'Verification Error';
            setStatus(`❌ ${message}`);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-10 md:p-14 w-full max-w-4xl relative z-10 overflow-hidden min-h-screen">
            <Meteors number={15} />

            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-center mb-16 relative"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />
                <div className="relative z-10">
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <ShieldCheck size={12} className="animate-pulse" />
                        Secure Session
                    </motion.div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-white uppercase">
                        Mark Your Presence
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed antialiased">
                        Confirm it's you to record your participation in this session.
                    </p>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto relative z-10"
            >
                <MagicCard className="p-10 md:p-14 text-center" gradientColor="rgba(34, 211, 238, 0.1)">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/40 border border-white/5 mb-10 shadow-inner">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isModelsLoaded ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-amber-400 animate-pulse"
                        )} />
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest antialiased">
                            {status}
                        </span>
                    </div>

                    <div className="relative group mb-10">
                        <div className="rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
                            <WebcamCapture onCapture={handleCapture} isLoading={isLoading || !isModelsLoaded} />
                            <div className="absolute inset-0 pointer-events-none border-[1rem] border-black/20" />
                            
                            <AnimatePresence>
                                {isLoading && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20"
                                    >
                                        <div className="w-12 h-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">{status.split('...')[0]}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-2xl animate-bounce">
                           <Camera size={20} />
                        </div>
                    </div>

                    <div className="flex items-start gap-4 text-left p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-10">
                        <Zap className="text-amber-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-slate-400 text-[11px] font-bold leading-relaxed antialiased">
                            Please face the camera in a well-lit area. Remove any heavy accessories that might cover your face for a successful match.
                        </p>
                    </div>

                    <button 
                        className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mx-auto py-2"
                        onClick={() => navigate('/student')}
                        disabled={isLoading}
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Cancel and Return
                    </button>
                </MagicCard>
            </motion.div>
        </div>
    );
}