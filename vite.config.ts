import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'
import { ROUTES } from './src/routes'

/**
 * GitHub Pages has no URL rewrites, so each page gets a real copy of
 * index.html (dist/journey/index.html, ...) and loads with a 200. Any other
 * path falls through to 404.html, the same app, which shows home.
 */
const routePages = (): Plugin => {
  let outDir = 'dist'
  return {
    name: 'route-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const index = join(outDir, 'index.html')
      for (const route of ROUTES) {
        if (route === '/') continue
        mkdirSync(join(outDir, route), { recursive: true })
        copyFileSync(index, join(outDir, route, 'index.html'))
      }
      copyFileSync(index, join(outDir, '404.html'))
    },
  }
}

// Preact stands in for React (same components, a fraction of the runtime).
// The site lives at the root of hadihaidar.tech. To serve it from a subfolder
// instead (hadihaith.github.io/hadihaith/ without the domain), build with SITE_BASE=/hadihaith/.
export default defineConfig(() => ({
  base: process.env.SITE_BASE ?? '/',
  plugins: [preact(), routePages()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    reportCompressedSize: true,
  },
}))
