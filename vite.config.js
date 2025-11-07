import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite dev server automatically handles SPA routing
  // Direct URL access works in development (e.g., /job-demand)
  // For production, configure your server (see ROUTING_SETUP.md)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

