import React, { useEffect, useRef, useState } from "react";
import { loadModels, getFaceMatch } from "../services/faceService";
import api from "../services/api";

const AttendancePage = () => {
    const videoRef = useRef();
    const [status, setStatus] = useState("Initializing AI...");
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [lectureId, setLectureId] = useState("");

    // Load models and start camera
    useEffect(() => {
        let stream = null;

        const setup = async () => {
            try {
                await loadModels();
                setIsModelsLoaded(true);

                stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setStatus("Ready for scanning. Please look at the camera.");
            } catch (err) {
                setStatus("Error setting up camera/AI: " + err.message);
            }
        };

        setup();

        // Cleanup: stop camera tracks on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Capture a frame from the video as base64
    const captureFrame = () => {
        const video = videoRef.current;
        if (!video) return null;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.8);
    };

    // Verify face and mark attendance
    const handleVerify = async () => {
        if (!isModelsLoaded) return;
        if (!lectureId.trim()) {
            setStatus("Please enter a Lecture ID first.");
            return;
        }

        setStatus("Fetching your reference photo...");
        try {
            const response = await api.get("/attendance/get-face");
            const storedFace = response.data.data.faceData;

            setStatus("Comparing faces... Stay still.");
            const match = await getFaceMatch(storedFace, videoRef.current);

            if (match && match.distance < 0.5) {
                setStatus("✅ Match Found! Recording attendance...");
                await markAttendanceOnServer();
            } else {
                setStatus("❌ Face Match Failed. Try again.");
            }
        } catch (err) {
            setStatus("Error: " + (err.response?.data?.message || err.message || "Not Logged In"));
        }
    };

    // Submit attendance to backend
    const markAttendanceOnServer = async () => {
        try {
            const liveFaceImage = captureFrame();
            if (!liveFaceImage) {
                setStatus("Failed to capture face frame.");
                return;
            }

            await api.post("/attendance/student/mark", {
                lectureId: lectureId.trim(),
                liveFaceImage
            });
            setStatus("✅ Attendance Marked Successfully!");
        } catch (err) {
            setStatus("Submission Failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Biometric Attendance</h1>
            <div style={{ margin: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "8px" }}>
                <strong>Status:</strong> {status}
            </div>

            <div style={{ margin: "10px" }}>
                <input
                    type="text"
                    placeholder="Enter Lecture ID"
                    value={lectureId}
                    onChange={(e) => setLectureId(e.target.value)}
                    style={{ padding: "8px 16px", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
            </div>

            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "400px", border: "5px solid #333", borderRadius: "10px" }}
            />

            <br />
            <button
                onClick={handleVerify}
                disabled={!isModelsLoaded}
                style={{
                    marginTop: "20px",
                    padding: "10px 30px",
                    fontSize: "18px",
                    cursor: isModelsLoaded ? "pointer" : "not-allowed",
                    opacity: isModelsLoaded ? 1 : 0.5
                }}
            >
                Verify &amp; Mark Present
            </button>
        </div>
    );
};

export default AttendancePage;