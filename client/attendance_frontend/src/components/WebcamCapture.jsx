import { useRef, useState, useCallback, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';

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
      setError('Camera access denied or unavailable. Please enable permissions.');
      console.error('Camera error:', err);
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
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Attach stream to video element when it mounts
  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // Capture current frame and send as base64 string
  const captureFrame = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setError('Webcam not fully initialized. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    // Draw current frame
    ctx.drawImage(videoRef.current, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    if (base64Image === 'data:,') {
      setError('Failed to capture frame. Ensure camera permissions and lighting are sufficient.');
      return;
    }

    onCapture(base64Image);
  };

  return (
    <div className="webcam-container" style={{ aspectRatio: '4/3', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '240px' }}>
      {error && (
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      
      {!cameraActive && !error ? (
        <button 
          type="button" 
          onClick={startCamera} 
          className="btn btn-secondary" 
          disabled={isLoading}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <FiCamera size={18} /> Enable Camera
        </button>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="webcam-overlay" />
          <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={captureFrame} 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ boxShadow: 'var(--glass-shadow)', borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-6)', minHeight: '48px', minWidth: '48px' }}
            >
              <FiCamera size={18} /> {isLoading ? 'Scanning...' : 'Capture Face'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
