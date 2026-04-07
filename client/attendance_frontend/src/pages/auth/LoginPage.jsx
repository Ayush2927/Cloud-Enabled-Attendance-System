import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebcamCapture from '../../components/WebcamCapture';
import * as faceapi from 'face-api.js';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

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
      
      const img = new Image();
      img.src = base64Image;
      await new Promise(resolve => img.onload = resolve);
      
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
      if (!detections) {
        throw new Error("No face detected in the webcam frame. Please look at the camera.");
      }

      // 2. Face found! Proceed to server authentication
      const user = await login(email, password, base64Image);
      // Let ProtectedRoute handle specific redirects, or navigate directly
      if (user.role === 'Student') navigate('/student');
      else if (user.role === 'Teacher') navigate('/teacher');
      else if (user.role === 'Admin') navigate('/admin');
    } catch (error) {
      // toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-accent">AttendEase</CardTitle>
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <CardDescription>
            Login with your credentials and biometric verification
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={e => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="you@college.edu" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label>Biometric Verification</Label>
              <WebcamCapture onCapture={handleCapture} isLoading={isLoading} />
              <p className="text-xs text-muted-foreground text-center">
                A live face scan is required to authenticate.
              </p>
            </div>
          </form>

          <div className="pt-2 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent/80 font-semibold">
              Request Registration
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
