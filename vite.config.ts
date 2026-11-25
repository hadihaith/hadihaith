import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// Preact stands in for React (same components, a fraction of the runtime).
// Relative base so the build works at hadihaith.github.io/hadihaith/ or on a custom domain.
export default defineConfig({
  base: './',
  plugins: [preact()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    reportCompressedSize: true,
  },
})
