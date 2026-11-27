import { useEffect, useRef } from 'react'
import { Brackets, Chamfer } from '../components/Shared'
import PixelIcon from '../components/PixelIcon'
import { CERTS, LINKS, PROJECTS } from '../data'
import Masthead from '../components/Masthead'
import { url } from '../router'
import { backpack } from '../pixels'
import poster from '../media/hero-backpack.webp'

const backpackFrames = [backpack]
const PLAY_ANCHOR = '#project-ttt'
const MOTION_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/** The poster is always in the first paint. Only mouse movement over it requests WebGL. */
function usePointerScene(posterRef: React.RefObject<HTMLImageElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const image = posterRef.current!
    const canvas = canvasRef.current!
    const hero = canvas.closest('section')!
    const media = window.matchMedia(MOTION_QUERY)
    let scene: import('./heroScene').HeroScene | undefined
    let observer: ResizeObserver | undefined
    let loading = false
    let failed = false
    let disposed = false
    let frame = 0
    let lastFrameAt = -Infinity
    let pointerUntil = 0
    let scrollAt = -Infinity

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      hero.removeAttribute('data-scene-active')
    }
    const pause = () => {
      pointerUntil = 0
      stop()
    }
    const onScroll = () => {
      scrollAt = performance.now()
      if (frame) pause()
    }
    const canDraw = () => (
      media.matches && !document.hidden && performance.now() - scrollAt > 150 && performance.now() < pointerUntil
    )
    const animate = (now: number) => {
      frame = 0
      if (!scene?.ready || !canDraw()) {
        stop()
        return
      }
      if (now - lastFrameAt >= 31) {
        scene.update(now)
        lastFrameAt = now
        if (!hero.hasAttribute('data-scene-active')) hero.dataset.sceneActive = ''
      }
      frame = requestAnimationFrame(animate)
    }
    const kick = () => {
      if (!frame && scene?.ready && canDraw()) frame = requestAnimationFrame(animate)
    }
    const onError = () => {
      failed = true
      pause()
      observer?.disconnect()
      scene?.dispose()
      scene = undefined
    }
    const loadScene = async () => {
      loading = true
      try {
        const { HeroScene, SUBJECT_TOP, SUBJECT_BOTTOM } = await import('./heroScene')
        if (disposed || !canDraw()) return
        const live = new HeroScene(canvas)
        scene = live
        const fit = () => {
          const bounds = hero.getBoundingClientRect()
          const art = image.getBoundingClientRect()
          if (!bounds.width || !bounds.height || !art.height) return
          const scale = (art.height / bounds.height) * 1.82 / (SUBJECT_TOP - SUBJECT_BOTTOM)
          live.resize(bounds.width, bounds.height)
          live.setFit({
            x: 2 * (art.left - bounds.left + art.width / 2) / bounds.width - 1,
            y: 1 - 2 * (art.top - bounds.top + art.height / 2) / bounds.height - (SUBJECT_TOP + SUBJECT_BOTTOM) / 2 * scale,
            scale,
          })
        }
        fit()
        observer = new ResizeObserver(fit)
        observer.observe(hero)
        observer.observe(image)
        live.setParams({ introDuration: 0.35, bgRevealOpacity: 0.45 })
        live.onReady = kick
        live.onError = onError
      } catch {
        if (!disposed) onError()
      } finally {
        loading = false
      }
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !media.matches || failed || performance.now() - scrollAt <= 150) return
      pointerUntil = performance.now() + 520
      if (!scene && !loading) void loadScene()
      if (!scene) return
      scene.setPointer(2 * event.clientX / window.innerWidth - 1, 2 * event.clientY / window.innerHeight - 1)
      kick()
    }

    image.addEventListener('pointermove', onMove, { passive: true })
    image.addEventListener('pointerleave', pause)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', pause)
    media.addEventListener('change', pause)
    canvas.addEventListener('webglcontextlost', onError)
    return () => {
      disposed = true
      pause()
      observer?.disconnect()
      scene?.dispose()
      image.removeEventListener('pointermove', onMove)
      image.removeEventListener('pointerleave', pause)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', pause)
      media.removeEventListener('change', pause)
      canvas.removeEventListener('webglcontextlost', onError)
    }
  }, [posterRef, canvasRef])
}

/* ---------- The block ---------- */
export default function Hero() {
  const image = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  usePointerScene(image, canvas)

  const current = PROJECTS.find((p) => p.id === 'pix')!
  const meta = [
    { icon: <span className="flag-kw" role="img" aria-label="Kuwait" />, label: 'kuwait' },
    { icon: <StarIcon />, label: 'kuwait university' },
    { icon: <CodeIcon />, label: 'full-stack engineer' },
  ]
  const stats = [
    { label: 'builds', value: String(PROJECTS.length) },
    { label: 'certs', value: String(CERTS.length) },
    { label: 'ai+x', value: '3rd' },
  ]

  return (
    <section data-hero className="hero" id="top">
      <div className="hero-scene" aria-hidden="true"><canvas ref={canvas} /></div>

      <div className="hero-column">
        <Masthead />

        <div className="hero-middle">
          <div className="identity">
            <div className="identity-id">
              @hadihaith
            </div>
            <h1 className="hero-name"><span>hadi</span>{' '}<span>haidar</span></h1>
            <ul className="identity-meta">
              {meta.map((m) => (
                <li key={m.label}>
                  {m.icon}
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-panels" data-hero-panels="">
            <div className="bracket-panel">
              <Brackets />
              <p className="eyebrow">current build</p>
              <div className="next-race">
                <dl>
                  <dt>{current.short}</dt>
                  <dd>android · kotlin</dd>
                  <dd>
                    <time dateTime="2026-11">in progress</time>
                  </dd>
                </dl>
                <PixelIcon frames={backpackFrames} size="4.375rem" off="rgb(9 10 11 / 0.08)" className="next-race-map" />
              </div>
            </div>
            <div className="bracket-panel">
              <Brackets />
              <p className="eyebrow">career stats</p>
              <dl className="hero-stats" data-hero-stats="">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd className="split">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="hero-figure" aria-hidden="true">
          <div className="hero-fit">
            <img ref={image} className="hero-poster" src={poster} alt="" width={562} height={687} fetchPriority="high" draggable={false} />
          </div>
        </div>

        <div className="hero-actions">
          <a
            className="trailer"
            href={url(PLAY_ANCHOR)}
          >
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="15.5" fill="none" stroke="currentColor" />
              <path d="M13 10.5v11l9-5.5z" fill="currentColor" />
            </svg>
            <span>
              <span className="trailer-title">play a round</span>
              <span className="trailer-time">tic-tac-toe</span>
            </span>
          </a>
          <Chamfer href={url('#workshop')} label="view projects" w={220} cut={8} variant="solid" className="hero-cta" />
          <ul className="socials">
            <li>
              <a href={url('/gallery')}>gallery</a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">github</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function StarIcon() {
  return (
    <svg className="meta-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0.5L9.6 6.4L15.5 8L9.6 9.6L8 15.5L6.4 9.6L0.5 8L6.4 6.4Z" fill="currentColor" />
    </svg>
  )
}
function CodeIcon() {
  return (
    <svg className="meta-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9.5 2.5l-3 11" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
