import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove base path for Amplify deployment (served from root)
  // base: '/event-calendar/', // Only needed for GitHub Pages
})
