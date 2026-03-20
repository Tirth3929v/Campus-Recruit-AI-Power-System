import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Forces Vite to use this port
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Points to your Express backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})