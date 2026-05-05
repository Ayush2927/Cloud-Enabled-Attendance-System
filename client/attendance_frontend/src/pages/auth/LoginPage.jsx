import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';

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
      // 1. Instantly load AI model to verify a face even exists in the frame
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      const img = new Image();
      const imgLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error("Failed to load image for scanning"));
      });
      img.src = base64Image;
      await imgLoadPromise;
      
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        throw new Error("No face detected in the webcam frame. Please look at the camera.");
      }

      const descriptor = Array.from(detections.descriptor);

      // 2. Face found! Proceed to server authentication
      const user = await login(email, password, base64Image, descriptor);
      // Let ProtectedRoute handle specific redirects, or navigate directly
      if (user?.role === 'Student') navigate('/student');
      else if (user?.role === 'Teacher') navigate('/teacher');
      else if (user?.role === 'Admin') navigate('/admin');
    } catch (error) {
      // toast is handled in AuthContext
      console.error("Login face scan error:", error);
      alert(error.message || "Failed to process face scan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card-glass auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 className="auth-logo">AttendEase</h1>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Login with your credentials and biometric verification</p>
        </div>

        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <input 
              id="login-email"
              type="email" 
              className="form-input" 
              placeholder="you@college.edu" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input 
              id="login-password"
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Biometric Verification</label>
            <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
              A live face scan is required to authenticate.
            </p>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Request Registration</Link>
        </div>
      </div>
    </div>
  );
}
