import Lenis from 'lenis'

/**
 * One rAF loop for the whole page. Subscribers run only when
 * `time - last > framerate()`, so 0 runs every tick and `1000/60 - 2`
 * gives 60 on a 60Hz screen and every second tick at 120.
 *
 * The loop rests. It only exists while something is subscribed, and when
 * every subscriber is slow (an ambient 30fps scene, say) it sleeps on a
 * timer between their frames instead of waking the renderer every vsync.
 * An idle page asks the browser for nothing.
 */
type Sub = { cb: (time: number) => void; rate: () => number; last: number }
const subs = new Set<Sub>()
let raf = 0
let timer = 0

const schedule = (now: number) => {
  if (!subs.size) return
  let due = Infinity
  for (const s of subs) due = Math.min(due, s.last + s.rate())
  const wait = due - now
  if (wait > 24) timer = window.setTimeout(() => ((timer = 0), (raf = requestAnimationFrame(loop))), wait - 12)
  else raf = requestAnimationFrame(loop)
}

const loop = (time: number) => {
  raf = 0
  for (const s of [...subs]) {
    if (time - s.last > s.rate()) {
      s.last = time
      s.cb(time)
    }
  }
  if (!raf && !timer) schedule(time)
}

const wake = () => {
  if (timer) {
    clearTimeout(timer)
    timer = 0
  }
  if (!raf) raf = requestAnimationFrame(loop)
}

export const subscribe = (cb: (time: number) => void, rate: () => number = () => 0) => {
  const s: Sub = { cb, rate, last: -Infinity }
  subs.add(s)
  wake()
  return () => {
    subs.delete(s)
    if (!subs.size) {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      raf = timer = 0
    }
  }
}

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Lenis runs from this loop, but only while it has something to do: input
 * wakes it, and it unsubscribes itself a few frames after the scroll settles.
 */
export const lenis: Lenis | null = reducedMotion ? null : new Lenis({ smoothWheel: true, autoRaf: false })
let lenisUnsub: (() => void) | null = null
let lenisQuiet = 0
export const wakeLenis = () => {
  if (!lenis) return
  lenisQuiet = 0
  if (lenisUnsub) return
  // Reset Lenis's clock first: its smoothing is time-based, and the gap since
  // it last ran would otherwise read as one enormous frame and jump the page.
  lenis.raf(performance.now())
  lenisUnsub = subscribe((time) => {
    lenis.raf(time)
    if (lenis.isScrolling) lenisQuiet = 0
    else if (++lenisQuiet > 12) {
      lenisUnsub?.()
      lenisUnsub = null
    }
  })
}
if (lenis) {
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'] as const)
    window.addEventListener(type, wakeLenis, { passive: true, capture: true })
  wakeLenis()
}
if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis | null }).__lenis = lenis

export const scrollToHash = (hash: string): void => {
  const el = document.querySelector(hash) as HTMLElement | null
  if (!el) {
    // The lower blocks render on idle; a click that beats them waits for the target.
    const mo = new MutationObserver(() => {
      if (!document.querySelector(hash)) return
      mo.disconnect()
      scrollToHash(hash)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => mo.disconnect(), 4000)
    return
  }
  if (lenis) {
    wakeLenis()
    lenis.scrollTo(el, { offset: 0 })
  } else el.scrollIntoView()
}

export const CAP_60 = 1000 / 60 - 2
export const CAP_30 = 1000 / 30 - 2

/**
 * Calls `cb` once per frame in which the page moved or resized: no work while
 * the page is still. Lenis moves the page inside its frame and reports it
 * straight away, so scroll-driven effects land in that same frame instead of
 * trailing it by one. Native scrolls (touch, scrollbar) come through the same
 * report; the plain listener is the fallback when Lenis is off.
 */
const scrollers = new Set<() => void>()
let scrollRaf = 0
let flushedAt = -1
let resized = false
const flushScroll = () => {
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  scrollRaf = 0
  const y = window.scrollY
  if (!resized && y === flushedAt) return
  resized = false
  flushedAt = y
  for (const f of scrollers) f()
}
let lastScrollAt = -Infinity
lenis?.on('scroll', () => {
  lastScrollAt = performance.now()
  flushScroll()
})
window.addEventListener(
  'scroll',
  () => {
    lastScrollAt = performance.now()
    if (!scrollRaf) scrollRaf = requestAnimationFrame(() => flushScroll())
  },
  { passive: true },
)
window.addEventListener('resize', () => {
  resized = true
  if (!scrollRaf) scrollRaf = requestAnimationFrame(() => flushScroll())
})

/** True while the page is moving, so heavy ambient work can ease off and leave the frame to the scroll. */
export const isScrolling = () => Boolean(lenis?.isScrolling) || performance.now() - lastScrollAt < 150
export const onScrollFrame = (cb: () => void) => {
  scrollers.add(cb)
  return () => scrollers.delete(cb)
}
