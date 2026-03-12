import React, { useEffect, useRef, useState } from 'react';
import { loadModels, getFaceMatch } from '../services/faceService';
import api from '../services/api'; 

const AttendancePage = () => {
    const videoRef = useRef();
    const [status, setStatus] = useState("Initializing AI...");
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);

    // 1. Load Models and Start Camera when page opens
    useEffect(() => {
        const setup = async () => {
            try {
                await loadModels(); // Calls your faceService.js logic
                setIsModelsLoaded(true);
                
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setStatus("Ready for scanning. Please look at the camera.");
            } catch (err) {
                setStatus("Error setting up camera/AI: " + err.message);
            }
        };
        setup();
    }, []);

    // 2. The Verification Trigger
    const handleVerify = async () => {
        if (!isModelsLoaded) return;
        
        setStatus("Fetching your reference photo...");
        try {
            // Get the "Golden Snapshot" from your backend
            const response = await api.get('/attendance/get-face');
            const storedFace = response.data.data.faceData;

            setStatus("Comparing faces... Stay still.");
            const match = await getFaceMatch(storedFace, videoRef.current);

            if (match && match.distance < 0.5) {
                setStatus(" Match Found! Recording attendance...");
                markAttendanceOnServer();
            } else {
                setStatus(" Face Match Failed. Try again.");
            }
        } catch (err) {
            setStatus("Error: " + (err.response?.data?.message || "Not Logged In"));
        }
    };

    // 3. Save to MongoDB
    const markAttendanceOnServer = async () => {
        try {
            await api.post('/attendance/student/mark', {
                subjectCode: "CS101", // You can change this later
                liveFaceImage: "Captured_Live_Proof" // In real use, capture a frame here
            });
            setStatus(" Attendance Marked Successfully!");
        } catch (err) {
            setStatus("Submission Failed: " + err.message);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Biometric Attendance</h1>
            <div style={{ margin: '20px', padding: '10px', background: '#f0f0f0' }}>
                <strong>Status:</strong> {status}
            </div>
            
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                style={{ width: '400px', border: '5px solid #333', borderRadius: '10px' }} 
            />
            
            <br />
            <button 
                onClick={handleVerify}
                style={{ marginTop: '20px', padding: '10px 30px', fontSize: '18px', cursor: 'pointer' }}
            >
                Verify & Mark Present
            </button>
        </div>
    );
};

export default AttendancePage;