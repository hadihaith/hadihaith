import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Rise, Split } from '../engine/Reveal'
import { COPY_FAST, REVEAL, Spring, TYPE, easeInOutSine, easeOutCubic, easeOutQuad } from '../engine/spring'
import { useMedia, useVisibleLoop } from '../engine/hooks'
import { CAP_30, reducedMotion, subscribe } from '../engine/ticker'
import { Arrow, Chequer, readToken } from '../components/Shared'
import { CERTS, ISSUERS, PROJECTS } from '../data'
import { logo } from '../media'
import { follow, url } from '../router'
import {
  CIRCUIT_MARKERS, CIRCUIT_PATH, CIRCUIT_STEP, CUMULATIVE, getDots, DOT_LATTICE, type DotField, DOT_RADIUS, FLAG, TOTAL, TRACK_BOX, TRACK_D, distanceAtTime,
  type Point,
} from './circuit'

type Rgb = readonly [number, number, number]
const ACCENT: Rgb = [2, 210, 227]
const WHITE: Rgb = [255, 255, 255]
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]
const BRIGHT = mix(ACCENT, WHITE, 0.55)
const rgba = ([r, g, b]: Rgb, alpha: number) => `rgb(${r} ${g} ${b} / ${alpha})`
const css = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`

/* ---------- The lap trace ---------- */
const LAP_MS = 6000
const COOL_MS = 800
const LINE_WIDTH = 5.9
const GLOW_WIDTH = 15
const HEAD_UNITS = 210
const MARKER_POP_UNITS = 90
const CUT_ALONG = 20
const CUT_ACROSS = 22

const trailUpTo = (distance: number) => {
  const out: Point[] = []
  for (let i = 0; i < CIRCUIT_PATH.length; i += 1) {
    if (CUMULATIVE[i] <= distance) {
      out.push(CIRCUIT_PATH[i])
      continue
    }
    const a = CIRCUIT_PATH[i - 1], b = CIRCUIT_PATH[i]
    const ratio = (distance - CUMULATIVE[i - 1]) / (CUMULATIVE[i] - CUMULATIVE[i - 1])
    out.push([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio])
    break
  }
  return out
}
const stroke = (c: CanvasRenderingContext2D, points: Point[], from = 0) => {
  c.beginPath()
  c.moveTo(points[from][0], points[from][1])
  for (let i = from + 1; i < points.length; i += 1) c.lineTo(points[i][0], points[i][1])
  c.stroke()
}
const drawTrail = (c: CanvasRenderingContext2D, points: Point[], heat: number) => {
  if (points.length < 2) return
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.save()
  c.globalCompositeOperation = 'lighter'
  c.strokeStyle = rgba(ACCENT, 0.05)
  c.lineWidth = GLOW_WIDTH
  stroke(c, points)
  c.strokeStyle = rgba(ACCENT, 0.1)
  c.lineWidth = GLOW_WIDTH * 0.45
  stroke(c, points)
  c.restore()
  const head = Math.max(2, Math.round(HEAD_UNITS / CIRCUIT_STEP))
  const from = Math.max(0, points.length - head)
  const tip = points[points.length - 1]
  const hot = c.createLinearGradient(points[from][0], points[from][1], tip[0], tip[1])
  hot.addColorStop(0, rgba(ACCENT, 0))
  hot.addColorStop(0.45, rgba(ACCENT, 0.9))
  hot.addColorStop(1, rgba(mix(ACCENT, BRIGHT, heat), 1))
  c.strokeStyle = hot
  c.lineWidth = LINE_WIDTH
  stroke(c, points, from)
  const coreFrom = Math.max(0, points.length - Math.round(head * 0.42))
  if (points.length - coreFrom > 1) {
    const core = c.createLinearGradient(points[coreFrom][0], points[coreFrom][1], tip[0], tip[1])
    core.addColorStop(0, rgba(BRIGHT, 0))
    core.addColorStop(1, rgba(WHITE, 0.95 * heat))
    c.strokeStyle = core
    c.lineWidth = LINE_WIDTH * 0.38
    stroke(c, points, coreFrom)
  }
}

/* ---------- The halftone + reticle ---------- */
const MIN_LEVEL = 0.02
const THRESHOLD = 0.34
const FADE = 0.9
const POINTER_HEAT = 0.95
const RETICLE_OPEN = 236
const RETICLE_SETTLE = 506
const SPREAD_OPEN = 0.38
const SPREAD_SHUT = 0.09
const RETICLE_ARM = 0.82
const RETICLE_CORE = 30
const POINTER_TRAIL = 0.07
const POINTER_RISE = 0.14
const POINTER_FALL = 0.3
const CHEQUER_FILL = 1
const CHEQUER_SEED = 0.7
const approach = (from: number, to: number, dt: number, tau: number) => to + (from - to) * Math.exp(-dt / Math.max(tau, 1e-4))
const falloff = (t: number) => (t >= 1 ? 0 : (1 - t) * (1 - t))

// Assigned by the gate below before the field first renders.
let DOTS: DotField

/** Waits until the block is near the viewport, then builds the dot field in idle time. */
function Halftone(props: { armed: boolean; sectionRef: React.RefObject<HTMLElement | null> }) {
  const probe = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const el = probe.current
    if (!el) return
    const idle = (cb: () => void) =>
      typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 1)
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        idle(() => {
          DOTS = getDots()
          setReady(true)
        })
      },
      { rootMargin: '100% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ready ? <HalftoneField {...props} /> : <div ref={probe} className="halftone" aria-hidden="true" />
}

function HalftoneField({ armed, sectionRef }: { armed: boolean; sectionRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baked = useRef<HTMLCanvasElement | null>(null)
  const wake = useRef<() => void>(() => {})
  const level = useRef(new Float32Array(DOTS.count))
  const active = useRef(new Int32Array(DOTS.count))
  const inList = useRef(new Uint8Array(DOTS.count))
  const activeCount = useRef(0)
  const pointer = useRef({ x: 0, y: 0, heat: 0 })
  const target = useRef({ x: 0, y: 0, on: false })
  const spread = useRef(0)
  const dirty = useRef(true)
  const armedRef = useRef(armed)
  armedRef.current = armed

  const index = useMemo(() => {
    const { columns, rows, count } = DOTS
    let minI = Infinity, maxI = -Infinity, minJ = Infinity, maxJ = -Infinity
    for (let i = 0; i < count; i += 1) {
      minI = Math.min(minI, columns[i]); maxI = Math.max(maxI, columns[i])
      minJ = Math.min(minJ, rows[i]); maxJ = Math.max(maxJ, rows[i])
    }
    const w = maxI - minI + 1, h = maxJ - minJ + 1
    const cell = new Int32Array(w * h).fill(-1)
    for (let i = 0; i < count; i += 1) cell[(rows[i] - minJ) * w + (columns[i] - minI)] = i
    return { cell, w, h, minI, minJ }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const bake = baked.current
    if (!canvas || !bake || !canvas.width) return
    const c = canvas.getContext('2d')!
    const scale = canvas.width / 1440
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.setTransform(scale, 0, 0, scale, 0, 0)
    c.drawImage(bake, 0, 0, 1440, 800)
    const { points, columns, rows } = DOTS
    const lv = level.current, act = active.current, count = activeCount.current
    const box = DOT_RADIUS * 2 + 1
    const span = 1 - THRESHOLD
    let drew = 0
    for (let k = 0; k < count; k++) {
      const idx = act[k]
      if (lv[idx] < THRESHOLD) continue
      c.clearRect(points[idx * 2] - DOT_RADIUS - 0.5, points[idx * 2 + 1] - DOT_RADIUS - 0.5, box, box)
      drew++
    }
    if (!drew) return
    for (let k = 0; k < count; k++) {
      const idx = act[k]
      const value = lv[idx]
      if (value < THRESHOLD) continue
      if ((columns[idx] + rows[idx]) & 1) continue
      const t = Math.min(1, (value - THRESHOLD) / span)
      const side = DOT_LATTICE.pitchX * (CHEQUER_SEED + (CHEQUER_FILL - CHEQUER_SEED) * t)
      c.fillStyle = css(value > 0.8 ? WHITE : value > 0.5 ? BRIGHT : mix(ACCENT, BRIGHT, value))
      c.fillRect(points[idx * 2] - side / 2, points[idx * 2 + 1] - side / 2, side, side)
    }
  }, [])

  const bake = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = canvas.clientWidth, height = canvas.clientHeight
    if (!width || !height) return
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const ratio = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 2)
    const w = Math.round(width * ratio), h = Math.round(height * ratio)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    const b = baked.current ?? document.createElement('canvas')
    baked.current = b
    b.width = w
    b.height = h
    const c = b.getContext('2d')!
    c.setTransform(w / 1440, 0, 0, w / 1440, 0, 0)
    c.fillStyle = readToken('--map-dot')
    c.beginPath()
    const { points, count } = DOTS
    for (let i = 0; i < count; i++) {
      const x = points[i * 2], y = points[i * 2 + 1]
      c.moveTo(x + DOT_RADIUS, y)
      c.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
    }
    c.fill()
    dirty.current = true
    draw()
  }, [draw])

  useEffect(() => {
    const ro = new ResizeObserver(bake)
    if (canvasRef.current) ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [bake])

  // Pointer: mouse only, inside the section, not on touch or under reduced motion.
  useEffect(() => {
    if (reducedMotion || window.matchMedia('(hover: none)').matches) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const canvas = canvasRef.current, section = sectionRef.current
      if (!canvas || !section) return
      const s = section.getBoundingClientRect()
      const inside = e.clientX >= s.left && e.clientX <= s.right && e.clientY >= s.top && e.clientY <= s.bottom
      const r = canvas.getBoundingClientRect()
      target.current = {
        x: ((e.clientX - r.left) / r.width) * 1440,
        y: ((e.clientY - r.top) / r.height) * 800,
        on: inside && armedRef.current,
      }
      if (target.current.on || pointer.current.heat > 0) wake.current()
    }
    const off = () => {
      target.current.on = false
      wake.current()
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', off)
    window.addEventListener('blur', off)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', off)
      window.removeEventListener('blur', off)
    }
  }, [sectionRef])

  useEffect(() => {
    let last = 0
    const { points } = DOTS
    const add = (i: number, value: number) => {
      if (value <= MIN_LEVEL) return
      const lv = level.current
      if (value > lv[i]) lv[i] = value
      if (!inList.current[i]) {
        inList.current[i] = 1
        active.current[activeCount.current++] = i
      }
    }
    const addPoint = (sx: number, sy: number, heat: number, reach: number) => {
      const { cell, w, h, minI, minJ } = index
      const i0 = Math.floor((sx - reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX)
      const i1 = Math.ceil((sx + reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX)
      const j0 = Math.floor((sy - reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY)
      const j1 = Math.ceil((sy + reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY)
      for (let j = Math.max(minJ, j0); j <= Math.min(minJ + h - 1, j1); j++) {
        const row = (j - minJ) * w
        for (let i = Math.max(minI, i0); i <= Math.min(minI + w - 1, i1); i++) {
          const idx = cell[row + (i - minI)]
          if (idx < 0) continue
          const d = Math.hypot(points[idx * 2] - sx, points[idx * 2 + 1] - sy)
          add(idx, falloff(d / reach) * heat)
        }
      }
    }
    const addReticle = () => {
      const src = pointer.current
      if (src.heat <= 0.01) return
      const { cell, w, h, minI, minJ } = index
      const ci = Math.round((src.x - DOT_LATTICE.originX) / DOT_LATTICE.pitchX)
      const cj = Math.round((src.y - DOT_LATTICE.originY) / DOT_LATTICE.pitchY)
      const arm = RETICLE_ARM * src.heat
      const reach = RETICLE_OPEN * spread.current
      if (reach > 1 && cj >= minJ && cj < minJ + h) {
        const row = (cj - minJ) * w
        const span = Math.ceil(reach / DOT_LATTICE.pitchX)
        for (let i = Math.max(minI, ci - span); i <= Math.min(minI + w - 1, ci + span); i++) {
          const idx = cell[row + (i - minI)]
          if (idx < 0) continue
          add(idx, (1 - Math.abs(points[idx * 2] - src.x) / reach) * arm)
        }
      }
      if (reach > 1 && ci >= minI && ci < minI + w) {
        const span = Math.ceil(reach / DOT_LATTICE.pitchY)
        for (let j = Math.max(minJ, cj - span); j <= Math.min(minJ + h - 1, cj + span); j++) {
          const idx = cell[(j - minJ) * w + (ci - minI)]
          if (idx < 0) continue
          add(idx, (1 - Math.abs(points[idx * 2 + 1] - src.y) / reach) * arm)
        }
      }
      addPoint(src.x, src.y, src.heat, RETICLE_CORE)
    }
    const frame = () => {
      const now = performance.now()
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
      last = now
      const p = pointer.current, t = target.current
      const wanted = t.on ? POINTER_HEAT : 0
      if (p.heat <= 0.001 && wanted > 0) {
        p.x = t.x
        p.y = t.y
      } else if (dt > 0) {
        const px = p.x, py = p.y
        p.x = approach(px, t.x, dt, POINTER_TRAIL)
        p.y = approach(py, t.y, dt, POINTER_TRAIL)
        const speed = Math.hypot(p.x - px, p.y - py) / dt
        const wantedSpread = Math.max(0, 1 - speed / RETICLE_SETTLE)
        spread.current = approach(spread.current, wantedSpread, dt, wantedSpread > spread.current ? SPREAD_OPEN : SPREAD_SHUT)
      }
      p.heat = approach(p.heat, wanted, dt, wanted > p.heat ? POINTER_RISE : POINTER_FALL)
      if (p.heat < 0.005) {
        p.heat = 0
        spread.current = 0
      }
      const decay = Math.exp(-dt / Math.max(0.05, FADE / 3))
      let write = 0
      const lv = level.current, act = active.current
      for (let k = 0; k < activeCount.current; k++) {
        const idx = act[k]
        const value = lv[idx] * decay
        if (value > MIN_LEVEL) {
          lv[idx] = value
          act[write++] = idx
        } else {
          lv[idx] = 0
          inList.current[idx] = 0
        }
      }
      const before = activeCount.current
      activeCount.current = write
      addReticle()
      // Nothing lit, no light, no cursor: go to sleep until the pointer wakes us.
      if (activeCount.current === 0 && p.heat === 0 && !t.on) {
        unsub?.()
        unsub = null
        last = 0
      }
      if (activeCount.current === 0 && before === 0 && !dirty.current) return
      dirty.current = false
      draw()
    }
    let unsub: (() => void) | null = null
    wake.current = () => {
      if (!unsub) unsub = subscribe(frame)
    }
    return () => unsub?.()
  }, [draw, index])

  return <canvas ref={canvasRef} className="halftone" aria-hidden="true" />
}

/* ---------- The stage: map, lap, markers ---------- */
function Stage({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trace = useRef<HTMLCanvasElement>(null)
  const lapMask = useRef<SVGPathElement>(null)
  const ping = useRef<SVGCircleElement>(null)
  const grid = useRef<SVGGElement>(null)
  const lap = useRef(0)
  const heat = useRef(1)
  const [armed, setArmed] = useState(false)
  const [lit, setLit] = useState(0)
  const narrow = useMedia('(max-width: 1023px)')

  const render = useCallback(() => {
    const canvas = trace.current
    if (!canvas) return
    const c = canvas.getContext('2d')!
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const ratio = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 2)
    const w = 1440 * ratio
    if (canvas.width !== w) {
      canvas.width = w
      canvas.height = 800 * ratio
    }
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.setTransform(ratio, 0, 0, ratio, 0, 0)
    const distance = distanceAtTime(lap.current)
    const points = trailUpTo(distance)
    const h = heat.current
    if (points.length > 1) {
      drawTrail(c, points, h)
      const [tx, ty] = points[points.length - 1]
      c.save()
      c.globalCompositeOperation = 'lighter'
      const spark = c.createRadialGradient(tx, ty, 0, tx, ty, LINE_WIDTH * 2.6)
      spark.addColorStop(0, rgba(WHITE, 0.85 * h))
      spark.addColorStop(0.35, rgba(BRIGHT, 0.4 * h))
      spark.addColorStop(1, rgba(ACCENT, 0))
      c.fillStyle = spark
      c.beginPath()
      c.arc(tx, ty, LINE_WIDTH * 2.6, 0, Math.PI * 2)
      c.fill()
      c.restore()
    }
    c.save()
    c.translate(FLAG.x, FLAG.y)
    c.rotate((FLAG.angle * Math.PI) / 180)
    c.clearRect(-CUT_ALONG / 2, -CUT_ACROSS / 2, CUT_ALONG, CUT_ACROSS)
    c.restore()
    let passed = 0
    for (const m of CIRCUIT_MARKERS) {
      if (distance < m.d) continue
      passed++
      const age = Math.min(1, (distance - m.d) / MARKER_POP_UNITS)
      const radius = 12 + (1 - age) * 14
      const g = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, radius)
      g.addColorStop(0, rgba(BRIGHT, 0.5 + 0.45 * (1 - age)))
      g.addColorStop(0.45, rgba(ACCENT, 0.32))
      g.addColorStop(1, rgba(ACCENT, 0))
      c.save()
      c.globalCompositeOperation = 'lighter'
      c.fillStyle = g
      c.beginPath()
      c.arc(m.x, m.y, radius, 0, Math.PI * 2)
      c.fill()
      c.restore()
      if (age < 1) {
        c.strokeStyle = rgba(BRIGHT, (1 - age) * 0.6)
        c.lineWidth = 1
        c.beginPath()
        c.arc(m.x, m.y, 9 + age * 20, 0, Math.PI * 2)
        c.stroke()
      }
    }
    setLit(passed)
    if (lapMask.current) lapMask.current.style.strokeDashoffset = String(TOTAL - distance)
  }, [])

  // One lap, when the block arrives. Never re-runs.
  useEffect(() => {
    const frame = frameRef.current!
    const cool = new Spring(1, { duration: COOL_MS, easing: easeOutCubic }, (v) => {
      heat.current = v
      render()
      if (v <= 0) setArmed(true)
    })
    const run = new Spring(0, { duration: LAP_MS, easing: easeInOutSine }, (v) => {
      lap.current = v
      render()
      if (v >= 1) cool.to(0)
    })
    render()
    if (reducedMotion) {
      run.set(1)
      cool.set(0)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        run.to(1)
      },
      { threshold: 0.35 },
    )
    io.observe(frame)
    return () => {
      io.disconnect()
      run.stop()
      cool.stop()
    }
  }, [render])

  // The grid crawls and the hub pings, only while the map is on screen.
  useVisibleLoop(
    frameRef,
    (now) => {
      grid.current?.style.setProperty('stroke-dashoffset', String(-((now % 7000) / 7000) * 20.5 * 0.5619))
      const e = easeOutQuad((now % 4200) / 4200)
      ping.current?.setAttribute('r', String(6 + e * 48))
      ping.current?.setAttribute('opacity', String(0.4 * (1 - e) * (1 - e)))
    },
    () => CAP_30,
    !reducedMotion,
  )

  // Fit: cover from 1024 up, the track box to the width below it.
  useEffect(() => {
    const frame = frameRef.current!
    const stage = stageRef.current!
    const fit = () => {
      const w = frame.clientWidth
      if (narrow) {
        const s = w / TRACK_BOX.width
        frame.style.height = `${TRACK_BOX.height * s}px`
        stage.style.transform = `translate(${-TRACK_BOX.x * s}px, ${-TRACK_BOX.y * s}px) scale(${s})`
      } else {
        frame.style.height = ''
        const h = frame.clientHeight
        const s = Math.max(w / 1440, h / 800)
        // Centred, unless that crops the track's right end (squarer windows): then slide left just enough.
        const x = Math.min((w - 1440 * s) / 2, w - (TRACK_BOX.x + TRACK_BOX.width) * s)
        stage.style.transform = `translate(${x}px, ${(h - 800 * s) / 2}px) scale(${s})`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [narrow])

  const axesX = [575, 930, 1285]
  const hub = { x: 930, y: 405 }
  const marks: [number, number][] = [[36.7, 45.9], [1389.5, 45.9], [36.7, 525.5], [1389.5, 525.5], [36.7, 757], [649.3, 757], [778.1, 757]]

  return (
    <div ref={frameRef} className="season-frame" aria-hidden="true">
      <div ref={stageRef} className="season-stage">
        <Halftone armed={armed} sectionRef={sectionRef} />
        <svg className="season-map" viewBox="0 0 1440 800">
          <defs>
            <mask id="flag-cut" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1640" height="1000">
              <rect x="-100" y="-100" width="1640" height="1000" fill="#fff" />
              <rect x={-CUT_ALONG / 2} y={-CUT_ACROSS / 2} width={CUT_ALONG} height={CUT_ACROSS} fill="#000" transform={`translate(${FLAG.x} ${FLAG.y}) rotate(${FLAG.angle})`} />
            </mask>
          </defs>
          <g ref={grid} className="map-grid" strokeDasharray={`${12.15 * 0.5619} ${8.35 * 0.5619}`}>
            {axesX.map((x) => (
              <line key={x} x1={x} x2={x} y1={-2250} y2={3050} />
            ))}
            <line x1={-2250} x2={3690} y1={hub.y} y2={hub.y} />
          </g>
          <circle cx={hub.x} cy={hub.y} r={39.25} className="map-ring" strokeWidth={1.7} />
          <circle cx={hub.x} cy={hub.y} r={200} className="map-ring-ghost" strokeWidth={1.2} />
          <circle cx={hub.x} cy={hub.y} r={248.7} className="map-ring-ghost" strokeWidth={1.2} />
          <circle ref={ping} cx={hub.x} cy={hub.y} r={6} fill="none" stroke="var(--accent)" strokeWidth={1.2} opacity={0} />
          <circle cx={hub.x} cy={hub.y} r={6} fill="var(--map-mark)" />
          {marks.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={9.4} height={9.4} fill="var(--map-mark)" />
          ))}
          <g mask="url(#flag-cut)">
            <path d={TRACK_D} className="map-track" />
            <path ref={lapMask} d={TRACK_D} className="map-lap" strokeDasharray={`${TOTAL} ${TOTAL + 60}`} style={{ strokeDashoffset: TOTAL }} />
          </g>
          <g transform={`translate(${FLAG.x} ${FLAG.y}) rotate(${FLAG.angle})`} fill="var(--map-mark)">
            {[0, 1].flatMap((col) =>
              [0, 1, 2, 3].map((row) =>
                (col + row) % 2 ? null : <rect key={`${col}${row}`} x={-5 + col * 5} y={-10 + row * 5} width={5} height={5} />,
              ),
            )}
          </g>
          <g className="map-markers">
            {CIRCUIT_MARKERS.map((m, i) => {
              const before = CIRCUIT_PATH[Math.max(0, Math.round(m.d / CIRCUIT_STEP) - 3)]
              const angle = (Math.atan2(m.y - before[1], m.x - before[0]) * 180) / Math.PI
              return (
                <g key={i}>
                  <polygon points="7.7,0 -3.85,6.67 -3.85,-6.67" transform={`translate(${m.x} ${m.y}) rotate(${angle})`} fill="var(--accent)" />
                  <text
                    x={m.x + m.dx}
                    y={m.y + m.dy}
                    textAnchor={m.anchor}
                    dominantBaseline="middle"
                    className={`map-label${i < lit ? ' is-lit' : ''}`}
                  >
                    {CERTS[i].date} · {CERTS[i].short}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
        <canvas ref={trace} className="season-trace" />
      </div>
    </div>
  )
}

/* ---------- The globe in the plate ---------- */
function Globe() {
  const ref = useRef<SVGEllipseElement>(null)
  const box = useRef<SVGSVGElement>(null)
  useVisibleLoop(
    box,
    (now) => ref.current?.setAttribute('rx', String(Math.max(0.5, Math.abs(Math.cos(((now % 10000) / 10000) * Math.PI * 2)) * 18))),
    () => CAP_30,
    !reducedMotion,
  )
  return (
    <svg ref={box} className="plate-globe" viewBox="0 0 37 23" aria-hidden="true">
      <ellipse cx="18.5" cy="11.5" rx="18" ry="11" />
      <line x1="0.5" y1="11.5" x2="36.5" y2="11.5" />
      <ellipse ref={ref} cx="18.5" cy="11.5" rx="18" ry="11" />
    </svg>
  )
}

export default function Season() {
  const section = useRef<HTMLElement>(null)
  const rows = [
    { k: String(CERTS.length).padStart(2, '0'), v: 'certificates' },
    { k: String(PROJECTS.length).padStart(2, '0'), v: 'builds shipped' },
    { k: '3rd', v: 'at ai+x.' },
  ]
  return (
    <section ref={section} data-season className="season" id="season" aria-labelledby="season-title">
      <Stage sectionRef={section} />
      <Chequer carry="light" className="chequer-season" />
      <div className="season-column">
        <div className="season-head">
          <h2 id="season-title" className="season-title">
            <Split text="the season" delay={0} />
            <span className="title-last">
              <Split text="so far" delay={130} />
              <Rise as="span" className="title-stop" delay={130 + 110} fadeOnly>
                .
              </Rise>
            </span>
          </h2>
          <Rise className="season-rule" delay={2 * 130} draw />
          <Split
            as="p"
            className="season-intro"
            text="Every build is a step forward. Here's how the record is shaping up."
            stagger={34}
            config={COPY_FAST}
            gap="0.22em"
            delay={2 * 130 + 90}
          />
        </div>

        <div className="season-foot">
          <Rise className="results" delay={200}>
            <p className="results-title">{CERTS.length} certificates</p>
            <ul className="results-logos" aria-label="Issued by">
              {[...new Set(CERTS.map((c) => c.from))].map((key) => (
                <li key={key} className={`results-logo${ISSUERS[key].wide ? ' results-logo-wide' : ''}`}>
                  <img src={logo(ISSUERS[key].logo)} alt={ISSUERS[key].name} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
            <a className="results-more" href={url('/certificates')} onClick={(e) => follow('/certificates', e)}>
              see them all
              <Arrow />
            </a>
          </Rise>

          <Rise className="plate" delay={260} config={REVEAL}>
            <svg className="plate-frame" viewBox="0 0 277 78" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0.5 0.5H276.5V69L268 77.5H0.5Z" />
              <line x1="83" y1="0.5" x2="83" y2="77.5" />
            </svg>
            <div className="plate-badge">
              <Globe />
              <span className="plate-mark">
                <Split text="CV" by="letters" stagger={22} config={TYPE} delay={430} className="plate-white" />
                <Split text="/ 2026" by="letters" stagger={22} config={TYPE} delay={490} className="plate-accent" />
              </span>
            </div>
            <dl className="plate-stats">
              {rows.map((r, i) => (
                <div key={r.v}>
                  <Split as="dt" text={r.k} by="letters" stagger={22} config={TYPE} delay={430 + i * 110} />
                  <Split as="dd" text={r.v} by="letters" stagger={22} config={TYPE} delay={430 + i * 110 + 70} />
                </div>
              ))}
            </dl>
          </Rise>
        </div>
      </div>
    </section>
  )
}
