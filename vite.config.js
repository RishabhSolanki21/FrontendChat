import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   define: {
    global: 'window',   // This fixes SockJS “global is not defined”
  },
  server: {
    host: true,            
    allowedHosts: true,        
    port: 5173
  }
})
