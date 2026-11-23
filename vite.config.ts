import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works at hadihaith.github.io/hadihaith/ or on a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
})
