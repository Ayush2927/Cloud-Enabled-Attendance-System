import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-accent">AttendEase</CardTitle>
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <CardDescription>Register your biometric profile</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            {/* Name and Role Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})} disabled={isLoading}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                disabled={isLoading}
              />
            </div>

            {/* Biometric */}
            <div className="space-y-3">
              <Label>Register Face (Required)</Label>
              <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
              <p className="text-xs text-muted-foreground text-center">
                This image will be stored as your master biometric footprint. Ensure good lighting.
              </p>
            </div>
          </form>

          <div className="pt-2 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 font-semibold">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
