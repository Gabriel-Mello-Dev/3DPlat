import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
   define: {
    'process.env.SUPPRESS_ONBUILD_ERROR': true,
  },
  server: {
    host: true,  // permite acessar via IP local
    port: 5173
  }
})
