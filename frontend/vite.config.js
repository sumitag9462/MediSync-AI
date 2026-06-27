import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Your existing proxy setup (if you have one)
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
      // Proxy uploaded files served from backend
      '/uploads': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
    },
  },
  // Add this build configuration to fix the error
  build: {
    target: 'esnext', // This tells Vite to use a modern JS environment that supports import.meta.env
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-animation';
            if (id.includes('@google') || id.includes('axios')) return 'vendor-api';
            return 'vendor';
          }
        }
      }
    }
  }
})