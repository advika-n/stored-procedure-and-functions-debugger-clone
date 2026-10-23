import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// No dev proxy: every backend call goes through src/api.js's API_BASE
// (VITE_API_URL, falling back to http://localhost:8000), and the backend's
// CORS middleware allows the Vite dev origin directly.
export default defineConfig({
  plugins: [react()],
})
