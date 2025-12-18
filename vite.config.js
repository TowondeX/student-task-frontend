import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Frontend runs on port 5173
  }
})