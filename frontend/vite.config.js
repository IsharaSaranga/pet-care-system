import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss(),react()],
  server: {
    port: 3000, // Always run on port 3000
    strictPort: true, // Fail if port 3000 is already in use (instead of switching to another port)
  },
  
})