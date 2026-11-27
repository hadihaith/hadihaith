import { useSyncExternalStore } from 'react'
import { lenis, wakeLenis } from './engine/ticker'
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
type AnchorOptions = { focus?: boolean; onFound?: (el: HTMLElement) => void }
let pendingAnchor: { hash: string; options?: AnchorOptions } | null = location.hash.length > 1 ? { hash: location.hash } : null
let cancelAnchor = () => {}
const scrollToHash = (hash: string, options?: AnchorOptions) => {
  cancelAnchor()
  let id: string
  try {
    id = decodeURIComponent(hash.slice(1))
  } catch {
    return
  }
  const scroll = () => {
    const target = document.getElementById(id)
    if (!target) return false
    if (options?.focus) {
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
    const immediate = Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 2
    if (lenis && !immediate) {
      lenis.resize()
      wakeLenis()
      lenis.scrollTo(target, { force: true })
    } else target.scrollIntoView()
    options?.onFound?.(target)
    return true
  }
  if (scroll()) return
  // Home sections load in their own chunks. Resolve the target as soon as it mounts.
  const observer = new MutationObserver(() => {
    if (document.getElementById(id)) {
      cancelAnchor()
      frame = requestAnimationFrame(() => scroll())
    }
  })
  let frame = 0
  const timeout = window.setTimeout(() => observer.disconnect(), 10000)
  cancelAnchor = () => {
    observer.disconnect()
    clearTimeout(timeout)
    cancelAnimationFrame(frame)
  }
  observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
}
const listeners = new Set<() => void>()
const go = (next: Route) => {
  if (next === current) return false
  cancelAnchor()
  current = next
  listeners.forEach((l) => l())
  return true
}
window.addEventListener('popstate', () => {
  pendingAnchor = location.hash.length > 1 ? { hash: location.hash } : null
  if (!go(read())) landed()
})
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
    scrollToHash(a.hash, a.options)
  } else {
    cancelAnchor()
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)
  }
}

type ClickLike = { preventDefault(): void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number }

/**
 * Follows a site link. '/path' links change the route; a '#anchor' clicked
 * from another page goes home first, then scrolls once home has rendered.
 * Modified clicks (new tab, new window) are left to the browser.
 */
export const follow = (href: string, e?: ClickLike, options?: AnchorOptions) => {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button ?? 0) !== 0)) return
  if (href.startsWith('/')) {
    e?.preventDefault()
    pendingAnchor = null
    history.pushState(null, '', url(href))
    if (!go(read())) landed()
    return
  }
  if (href.startsWith('#')) {
    e?.preventDefault()
    if (current !== '/' || location.hash !== href) history.pushState(null, '', url(href))
    if (current === '/') scrollToHash(href, options)
    else {
      pendingAnchor = { hash: href, options }
      go('/')
    }
  }
}
