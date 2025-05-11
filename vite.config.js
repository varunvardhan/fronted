import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176, // Set Vite to run on port 5176
    proxy: {
      '/api': {
        target: 'https://stage.copanelist.bookmyinterview.in',
        // target: 'http://127.0.0.1:8000', // Uncomment to use local backend
        // target: 'http://3.108.63.116',
        changeOrigin: true,
      },
    },
  },
});