import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'
import { PAGE_META, ROUTES, SITE_URL, canonical, type Route } from './src/routes'

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** index.html with one page's title, description and canonical URL, for crawlers and link previews that never run the app. */
const pageHtml = (html: string, route: Route) => {
  const { title, description } = PAGE_META[route]
  const url = canonical(route)
  const swaps: [RegExp, string][] = [
    [/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${url}`],
    [/(<meta name="description" content=")[^"]*/, `$1${attr(description)}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${attr(title)}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${attr(description)}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${url}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${attr(title)}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${attr(description)}`],
  ]
  return swaps.reduce((out, [pattern, value]) => {
    // A tag renamed in index.html must fail the build, not ship every page with the home page's preview.
    if (!pattern.test(out)) throw new Error(`route-pages: index.html is missing ${pattern}`)
    return out.replace(pattern, value)
  }, html)
}

/**
 * GitHub Pages has no URL rewrites, so each page gets its own copy of
 * index.html with its own title, description and canonical URL. It is written
 * as both journey.html (so /journey loads without a redirect) and
 * journey/index.html (so /journey/ does too). Any other path falls through
 * to 404.html, the same app, which shows home and asks not to be indexed.
 * The build also writes robots.txt and sitemap.xml.
 */
const routePages = (): Plugin => {
  let outDir = 'dist'
  let base = '/'
  const pageFiles = { '/': 'Home', '/journey': 'Journey', '/certificates': 'Certificates', '/gallery': 'Gallery' }
  const pagePreloads = new Map<Route, string>()
  return {
    name: 'route-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
      base = config.base
    },
    generateBundle(_, bundle) {
      for (const route of ROUTES) {
        const chunk = Object.values(bundle).find((item) =>
          item.type === 'chunk' && item.facadeModuleId?.endsWith(`/src/pages/${pageFiles[route]}.tsx`),
        )
        if (chunk) pagePreloads.set(route, `<link rel="modulepreload" crossorigin href="${attr(base + chunk.fileName)}">`)
      }
    },
    closeBundle() {
      const index = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const route of ROUTES) {
        const preload = pagePreloads.get(route)
        const html = pageHtml(index, route).replace('</head>', `${preload ? `  ${preload}\n  ` : ''}</head>`)
        if (route === '/') {
          writeFileSync(join(outDir, 'index.html'), html)
          continue
        }
        writeFileSync(join(outDir, `${route.slice(1)}.html`), html)
        mkdirSync(join(outDir, route), { recursive: true })
        writeFileSync(join(outDir, route, 'index.html'), html)
      }
      writeFileSync(join(outDir, '404.html'), index.replace('<head>', '<head>\n    <meta name="robots" content="noindex" />'))
      writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
      const today = new Date().toISOString().slice(0, 10)
      const urls = ROUTES.map((r) => `  <url><loc>${canonical(r)}</loc><lastmod>${today}</lastmod></url>`).join('\n')
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )
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
