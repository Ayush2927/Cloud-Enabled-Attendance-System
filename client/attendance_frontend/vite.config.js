import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
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