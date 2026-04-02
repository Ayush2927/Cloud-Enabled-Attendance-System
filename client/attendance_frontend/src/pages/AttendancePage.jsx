import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';

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
    const [status, setStatus] = useState('Initializing AI...');
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!lectureId) {
            toast.error('Invalid lecture session selected.');
            navigate('/student');
            return;
        }

        const init = async () => {
            const loaded = await loadModels();
            setIsModelsLoaded(loaded);
            setStatus(loaded ? 'Ready for biometric scan' : 'Failed to load AI models');
        };
        init();
    }, [lectureId, navigate]);

    // Perform actual face matching
    const performFaceMatch = async (referenceBase64, liveBase64) => {
        try {
            // Helper function to convert base64 to HTMLImageElement
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

            // Need tinyFaceDetector options
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });

            // Compute descriptors
            const refResults = await faceapi.detectSingleFace(refImage, options)
                                         .withFaceLandmarks()
                                         .withFaceDescriptor();
                                         
            const liveResults = await faceapi.detectSingleFace(liveImage, options)
                                          .withFaceLandmarks()
                                          .withFaceDescriptor();

            if (!refResults) throw new Error("Could not detect any face in your registered profile image.");
            if (!liveResults) throw new Error("Could not detect your face in the webcam snapshot. Ensure good lighting.");

            // Calculate distance (lower is better, threshold typically 0.5 or 0.6)
            const distance = faceapi.euclideanDistance(refResults.descriptor, liveResults.descriptor);
            console.log("Face Match distance:", distance);
            
            return distance < 0.55; 
        } catch (error) {
            throw error;
        }
    };

    const handleCapture = async (liveFaceImage) => {
        if (!isModelsLoaded) {
            toast.error('AI models are still loading...');
            return;
        }

        setIsLoading(true);
        setStatus('Fetching your reference identity...');

        try {
            // 1. Fetch user's registered face (reference)
            const response = await api.get('/attendance/get-face');
            const storedFace = response.data.data.faceData;

            setStatus('Comparing faces... Stay still.');
            
            // 2. Run Face-API match natively in browser
            const isMatch = await performFaceMatch(storedFace, liveFaceImage);

            if (isMatch) {
                setStatus('✅ Match Found! Securing attendance record...');
                
                // 3. Inform server (Server performs window/duplicate checks)
                await api.post('/attendance/student/mark', {
                    lectureId,
                    liveFaceImage
                });

                toast.success('Successfully marked present!');
                navigate('/student/stats');
            } else {
                setStatus('❌ Verification failed: Faces do not match.');
                toast.error('Biometric verification failed.');
            }
        } catch (err) {
            const message = err.message || err.response?.data?.message || 'Verification Error';
            setStatus(`❌ Error: ${message}`);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page animate-fade-in">
            <div className="page-header text-center">
                <h1 className="page-title">Biometric Verification</h1>
                <p className="page-subtitle">Verify your identity to lock in your attendance.</p>
            </div>

            <div className="attendance-shell">
                <div className="card-glass page-section text-center">
                    <div className="status-panel">
                        <strong>System Status:</strong> <span className={isModelsLoaded ? 'status-success' : 'status-warning'}>{status}</span>
                    </div>

                    <div className="page-section-sm">
                        <WebcamCapture onCapture={handleCapture} isLoading={isLoading || !isModelsLoaded} />
                    </div>

                    <p className="text-muted">
                        Look directly into the camera. Ensure you are well-lit and not wearing heavy accessories.
                    </p>
                </div>

                <div className="text-center">
                    <button className="btn btn-ghost" onClick={() => navigate('/student')} disabled={isLoading}>
                        Cancel & Return
                    </button>
                </div>
            </div>
        </div>
    );
}