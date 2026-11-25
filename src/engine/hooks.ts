import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { onScrollFrame, subscribe } from './ticker'
import { Spring, TRIGGER } from './spring'

export type Mode = 'always' | 'once' | 'forward'

/**
 * The in-view gate. `once` latches, `forward` holds while the element is
 * above the viewport (scrolled past) and only resets when it drops below it.
 */
export function useEnabled(ref: React.RefObject<Element | null>, mode: Mode = 'forward', rootMargin = '0px', skip = false) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || skip) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true)
        else if (mode === 'once') return
        else if (mode === 'forward' && entry.boundingClientRect.top <= 0) setOn(true)
        else setOn(false)
        if (entry.isIntersecting && mode === 'once') io.disconnect()
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, mode, rootMargin, skip])
  return on
}

type Pose = 'top_top' | 'center_top' | 'bottom_top' | 'top_bottom' | 'center_bottom' | 'bottom_bottom' | 'top_center' | 'center_center' | 'bottom_center'

export const progressOf = (bb: DOMRect, start: Pose, end: Pose) => {
  const vh = window.innerHeight
  const poses: Record<Pose, number> = {
    top_top: bb.top,
    center_top: bb.top + bb.height / 2,
    bottom_top: bb.bottom,
    top_bottom: bb.top - vh,
    center_bottom: bb.top + bb.height / 2 - vh,
    bottom_bottom: bb.bottom - vh,
    top_center: bb.top - vh / 2,
    center_center: bb.top + bb.height / 2 - vh / 2,
    bottom_center: bb.bottom - vh / 2,
  }
  const scrollStart = poses[start]
  const scrollEnd = poses[end]
  const length = Math.abs(scrollStart - scrollEnd) || 1
  return Math.min(Math.max(0, 1 - (scrollStart + length) / length), 1)
}

/**
 * A scrub trigger: progress 0→1 between two poses. It recomputes only on a
 * real scroll or resize frame while the element is in view, and once more as
 * it leaves, so it settles at its end state. A still page costs nothing.
 * With `smooth`, the value is passed through a TRIGGER spring first.
 */
export function useScrub(
  ref: React.RefObject<Element | null>,
  start: Pose,
  end: Pose,
  onProgress: (p: number) => void,
  smooth = false,
) {
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const spring = smooth ? new Spring(0, TRIGGER, (v) => cb.current(v)) : null
    let last = -1
    let inView = false
    const run = () => {
      const p = progressOf(el.getBoundingClientRect(), start, end)
      if (p === last) return
      last = p
      if (spring) spring.to(p)
      else cb.current(p)
    }
    run()
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      run()
    })
    io.observe(el)
    const off = onScrollFrame(() => inView && run())
    return () => {
      off()
      io.disconnect()
      spring?.stop()
    }
  }, [ref, start, end, smooth])
}

/**
 * Runs `cb` on the shared ticker only while the element is on screen. Off
 * screen it is unsubscribed outright, so it never keeps the loop awake.
 */
export function useVisibleLoop(
  ref: React.RefObject<Element | null>,
  cb: (now: number) => void,
  rate: () => number = () => 0,
  enabled = true,
) {
  const f = useRef(cb)
  f.current = cb
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let unsub: (() => void) | null = null
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !unsub) unsub = subscribe((t) => f.current(t), rate)
      else if (!e.isIntersecting && unsub) {
        unsub()
        unsub = null
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      unsub?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enabled])
}

/* ---------- The hero's entrance, released by the loading veil ---------- */
let entered = false
const listeners = new Set<() => void>()
export const releaseEntrance = () => {
  entered = true
  listeners.forEach((l) => l())
}
export const useEntered = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => entered,
  )

export const useMedia = (query: string) =>
  useSyncExternalStore(
    (l) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', l)
      return () => m.removeEventListener('change', l)
    },
    () => window.matchMedia(query).matches,
  )
