import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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