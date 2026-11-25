import { useSyncExternalStore } from 'react'
import { lenis, scrollToHash } from './engine/ticker'

/**
 * A hash router: `#/journey`, `#/gallery`, and `#/` (or no hash) for home.
 * Hash routes work on GitHub Pages with no server rewrite. Plain `#anchor`
 * links are in-page anchors on the home page, not routes.
 */
export type Route = '/' | '/journey' | '/gallery'
const ROUTES: Route[] = ['/', '/journey', '/gallery']

const read = (): Route => {
  const h = location.hash
  if (!h.startsWith('#/')) return '/'
  const path = h.slice(1).split('?')[0].replace(/\/$/, '') || '/'
  return (ROUTES as string[]).includes(path) ? (path as Route) : '/'
}

let current = read()
let pendingAnchor: string | null = null
const listeners = new Set<() => void>()
window.addEventListener('hashchange', () => {
  // An in-page anchor on home (#season) is not a route change.
  if (!location.hash.startsWith('#/') && location.hash.length > 1) return
  const next = read()
  if (next === current) return
  current = next
  listeners.forEach((l) => l())
})

export const useRoute = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )

/** Called by a page once it has mounted: go to the top, or to the anchor a link asked for. */
export const landed = () => {
  if (pendingAnchor) {
    const a = pendingAnchor
    pendingAnchor = null
    requestAnimationFrame(() => scrollToHash(a))
  } else if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

/**
 * Follows a site link. Routes change the hash; a home anchor clicked from
 * another page goes home first, then scrolls once home has rendered.
 */
export const follow = (href: string, e?: { preventDefault(): void }) => {
  if (href.startsWith('#/')) {
    e?.preventDefault()
    if (location.hash !== href) location.hash = href
    else landed()
    return
  }
  if (href.startsWith('#')) {
    e?.preventDefault()
    if (current === '/') scrollToHash(href)
    else {
      pendingAnchor = href
      location.hash = '#/'
    }
  }
}
