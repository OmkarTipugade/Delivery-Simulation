import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server:{
    proxy: {
      '/backend': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/backend/, '')
      }
    }
  }
});
