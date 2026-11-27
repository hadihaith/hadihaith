import { useSyncExternalStore } from 'react'
import { lenis, scrollToHash } from './engine/ticker'
import { ROUTES, type Route } from './routes'

/**
 * A history router with real paths: `/journey`, `/certificates`, `/gallery`
 * and `/` for home, all under the site's base (`/hadihaith/` on GitHub Pages,
 * `/` in dev). The build writes a copy of index.html into each route's folder
 * so every path loads directly. Plain `#anchor` links are sections of home.
 */
export type { Route }

/** The site's base path, always with a trailing slash. */
const BASE = import.meta.env.BASE_URL

/** A site link as a real URL: '/journey' → '/hadihaith/journey', '#season' → '/hadihaith/#season'. */
export const url = (href: string) => (href.startsWith('/') ? BASE + href.slice(1) : href.startsWith('#') ? BASE + href : href)

const read = (): Route => {
  const path = '/' + location.pathname.slice(BASE.length).replace(/\/+$/, '').replace(/^\/+/, '')
  return (ROUTES as readonly string[]).includes(path) ? (path as Route) : '/'
}

// Links from the old hash router (#/journey) still land on the right page.
const fromOldHash = () => {
  if (!location.hash.startsWith('#/')) return false
  history.replaceState(null, '', url(location.hash.slice(1).replace(/\/$/, '') || '/'))
  return true
}
fromOldHash()

let current = read()
// Opened at /#workshop: scroll there once home has rendered.
let pendingAnchor: string | null = location.hash.length > 1 ? location.hash : null
const listeners = new Set<() => void>()
const go = (next: Route) => {
  if (next === current) return false
  current = next
  listeners.forEach((l) => l())
  return true
}
window.addEventListener('popstate', () => go(read()))
window.addEventListener('hashchange', () => fromOldHash() && go(read()))

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

type ClickLike = { preventDefault(): void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number }

/**
 * Follows a site link. '/path' links change the route; a '#anchor' clicked
 * from another page goes home first, then scrolls once home has rendered.
 * Modified clicks (new tab, new window) are left to the browser.
 */
export const follow = (href: string, e?: ClickLike) => {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button ?? 0) !== 0)) return
  if (href.startsWith('/')) {
    e?.preventDefault()
    history.pushState(null, '', url(href))
    if (!go(read())) landed()
    return
  }
  if (href.startsWith('#')) {
    e?.preventDefault()
    if (current === '/') scrollToHash(href)
    else {
      pendingAnchor = href
      history.pushState(null, '', url('/'))
      go('/')
    }
  }
}
