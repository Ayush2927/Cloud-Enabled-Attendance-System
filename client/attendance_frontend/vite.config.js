import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cloud-enabled-attendance-system-hxlg.onrender.com',
        changeOrigin: true,
        secure: false, // Bypass SSL validation if needed in dev proxy
      }
    }
  }
})