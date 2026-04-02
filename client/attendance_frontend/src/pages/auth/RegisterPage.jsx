import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCapture = async (base64Image) => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All text fields are required before scanning');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Instantly load AI model to verify a face even exists in the frame
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      const img = new Image();
      img.src = base64Image;
      await new Promise(resolve => img.onload = resolve);
      
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
      if (!detections) {
        throw new Error("No face detected! Please ensure your face is clearly visible.");
      }

      // 2. Face found! Create payload
      const payload = {
        ...formData,
        faceImage: base64Image
      };

      await api.post('/auth/register', payload);
      toast.success('Registration successful! You can now login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card-glass auth-card" style={{ maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 className="auth-logo">AttendEase</h1>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register your biometric profile</p>
        </div>

        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-select"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                disabled={isLoading}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Register Face (Required)</label>
            <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
              This image will be stored as your master biometric footprint. Ensure good lighting.
            </p>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
