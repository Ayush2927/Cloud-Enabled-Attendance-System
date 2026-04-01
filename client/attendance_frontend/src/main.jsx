import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster 
      position="top-right"
      toastOptions={{
        className: 'toast-custom',
        duration: 4000,
        style: {
          background: '#1e2230',
          color: '#e8eaf0',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }
      }}
    />
  </StrictMode>,
)
