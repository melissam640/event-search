import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// use BACKEND_URL env var if provided, otherwise default to localhost:8080
const backend = process.env.BACKEND_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
