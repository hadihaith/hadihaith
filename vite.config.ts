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
// The site lives at hadihaith.github.io/hadihaith/; set SITE_BASE=/ for a custom domain.
// The dev server stays at '/'; the build and `vite preview` use the real base.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? (process.env.SITE_BASE ?? '/hadihaith/') : '/',
  plugins: [preact(), routePages()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    reportCompressedSize: true,
  },
}))
