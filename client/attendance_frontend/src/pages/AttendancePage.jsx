import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';
import { FiHome, FiCheckSquare, FiPieChart, FiSettings } from 'react-icons/fi';
import FeatureHub from '../components/ui/FeatureHub';

// Utility to load AI Models
const loadModels = async () => {
    try {
        const MODEL_URL = '/models';
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

        const studentFeatures = [
            { id: 'student-home', title: 'Dashboard', description: 'Return to your lecture timeline.', icon: <FiHome size={18} />, onClick: () => navigate('/student') },
            { id: 'student-attendance', title: 'Mark Attendance', description: 'Continue biometric attendance capture.', icon: <FiCheckSquare size={18} />, onClick: () => navigate(`/student/mark-attendance/${lectureId || ''}`) },
            { id: 'student-stats', title: 'My Stats', description: 'Check your attendance performance and risks.', icon: <FiPieChart size={18} />, onClick: () => navigate('/student/stats') },
            { id: 'student-settings', title: 'Settings', description: 'Update account and security preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
        ];

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
            const createImage = (b64, label) => {
                return new Promise((resolve, reject) => {
                    if (!b64 || typeof b64 !== 'string') {
                        return reject(new Error(`Invalid image data provided for ${label}`));
                    }
                    const img = new Image();
                    // crossOrigin is not needed for base64 data URIs and can cause issues
                    // img.crossOrigin = 'Anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`Failed to load ${label} image for face detection.`));
                    img.src = b64;
                });
            };

            const refImage = await createImage(referenceBase64, 'reference');
            const liveImage = await createImage(liveBase64, 'live webcam');

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

            // Calculate distance (lower is better)
            // 0.6 is too lenient. 0.42 enforces a strict exact-person match.
            const distance = faceapi.euclideanDistance(refResults.descriptor, liveResults.descriptor);
            console.log("Face Match distance:", distance);
            
            return {
                isMatch: distance < 0.42,
                descriptor: Array.from(liveResults.descriptor)
            };
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
            const { isMatch, descriptor } = await performFaceMatch(storedFace, liveFaceImage);

            if (isMatch) {
                setStatus('✅ Match Found! Securing attendance record...');
                
                // 3. Inform server (Server performs window/duplicate checks)
                await api.post('/attendance/student/mark', {
                    lectureId,
                    liveFaceImage,
                    liveFaceDescriptor: descriptor
                });

                toast.success('Successfully marked present!');
                navigate('/student/stats');
            } else {
                setStatus('❌ Verification failed: Faces do not match.');
                toast.error('Biometric verification failed.');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Verification Error';
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

                <FeatureHub title="Student Features" items={studentFeatures} />
            </div>
        </div>
    );
}