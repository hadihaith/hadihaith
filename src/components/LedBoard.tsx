import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { textToColumns, SUPPORTED } from '../pixelFont'
import { LED } from '../data'

const ROWS = 16
const TEXT_TOP = 4
const STEP_MS = 55
const TEXT_COLORS = [LED.p, LED.a, LED.t, LED.v]
const PAINTS = [
  { name: 'Pink', value: LED.p },
  { name: 'Amber', value: LED.a },
  { name: 'Teal', value: LED.t },
  { name: 'Violet', value: LED.v },
  { name: 'White', value: LED.w },
]
const DEFAULT_MESSAGE = "HI, I'M HADI ♥ I BUILD WEB APPS, GAMES & GADGETS ♥ TYPE BELOW OR DRAW ON ME"

export default function LedBoard() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(new Map<string, string>())
  const pointer = useRef<{ mode: 'paint' | 'erase'; last: [number, number] } | null>(null)
  const geom = useRef({ cols: 64, cell: 12 })
  const reduce = useReducedMotion()

  const [message, setMessage] = useState('')
  const [paint, setPaint] = useState(PAINTS[0].value)
  const [hasDrawing, setHasDrawing] = useState(false)

  const shown = message.trim() || DEFAULT_MESSAGE
  const columns = useRef(textToColumns(shown))
  const offset = useRef(0)

  useEffect(() => {
    columns.current = textToColumns(shown)
    offset.current = message ? geom.current.cols - 2 : offset.current
  }, [shown, message])

  // Size the canvas to its container.
  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth
      const cols = Math.max(32, Math.min(80, Math.floor(w / 11)))
      const cell = w / cols
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(cell * ROWS * dpr)
      canvas.style.height = `${cell * ROWS}px`
      geom.current = { cols, cell: cell * dpr }
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Render loop.
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let last = performance.now()
    let acc = 0

    const frame = (now: number) => {
      const { cols, cell } = geom.current
      const cols_ = columns.current
      if (!reduce) {
        acc += now - last
        while (acc > STEP_MS) {
          offset.current += 1
          acc -= STEP_MS
          if (offset.current > cols + cols_.length) offset.current = 0
        }
      } else {
        offset.current = cols - 1 // text starts at column 1 and stays put
      }
      last = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const r = cell * 0.36
      const startX = cols - offset.current
      for (let c = 0; c < cols; c++) {
        const textCol = cols_[c - startX]
        for (let row = 0; row < ROWS; row++) {
          let color = drawing.current.get(`${row},${c}`)
          if (!color && textCol) {
            const tr = row - TEXT_TOP
            if (tr >= 0 && tr < 7 && textCol.bits[tr]) color = TEXT_COLORS[textCol.char % TEXT_COLORS.length]
          }
          const x = c * cell + cell / 2
          const y = row * cell + cell / 2
          if (color) {
            ctx.globalAlpha = 0.22
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, cell * 0.62, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
          } else {
            ctx.fillStyle = '#2A2552'
          }
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  const cellAt = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const { cols } = geom.current
    const size = rect.width / cols
    const c = Math.floor((e.clientX - rect.left) / size)
    const r = Math.floor((e.clientY - rect.top) / size)
    if (c < 0 || c >= cols || r < 0 || r >= ROWS) return null
    return [r, c] as [number, number]
  }

  // Paint every cell on the line from the last point, so fast drags leave no gaps.
  const apply = (to: [number, number]) => {
    const p = pointer.current
    if (!p) return
    const [r0, c0] = p.last
    const steps = Math.max(Math.abs(to[0] - r0), Math.abs(to[1] - c0), 1)
    for (let i = 0; i <= steps; i++) {
      const key = `${Math.round(r0 + ((to[0] - r0) * i) / steps)},${Math.round(c0 + ((to[1] - c0) * i) / steps)}`
      if (p.mode === 'erase') drawing.current.delete(key)
      else drawing.current.set(key, paint)
    }
    p.last = to
    setHasDrawing(drawing.current.size > 0)
  }

  return (
    <div className="board">
      <div className="board-screen" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`LED board scrolling: ${shown}`}
          onPointerDown={(e) => {
            const cell = cellAt(e)
            if (!cell) return
            e.currentTarget.setPointerCapture(e.pointerId)
            const existing = drawing.current.get(`${cell[0]},${cell[1]}`)
            pointer.current = { mode: existing === paint ? 'erase' : 'paint', last: cell }
            apply(cell)
          }}
          onPointerMove={(e) => {
            if (!pointer.current) return
            const cell = cellAt(e)
            if (cell) apply(cell)
          }}
          onPointerUp={() => (pointer.current = null)}
          onPointerCancel={() => (pointer.current = null)}
        />
      </div>
      <div className="board-controls">
        <label className="board-input">
          <span className="sr-only">Message for the board</span>
          <input
            value={message}
            maxLength={48}
            placeholder="Type a message for the board"
            onChange={(e) =>
              setMessage(
                [...e.target.value.toUpperCase()].filter((ch) => SUPPORTED.has(ch)).join(''),
              )
            }
          />
        </label>
        <fieldset className="swatches">
          <legend className="sr-only">Paint color</legend>
          {PAINTS.map((p) => (
            <label key={p.value} className="swatch" style={{ '--c': p.value } as React.CSSProperties}>
              <input
                type="radio"
                name="paint"
                checked={paint === p.value}
                onChange={() => setPaint(p.value)}
              />
              <span className="sr-only">{p.name}</span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          className="btn-quiet"
          disabled={!hasDrawing}
          onClick={() => {
            drawing.current.clear()
            setHasDrawing(false)
          }}
        >
          Clear drawing
        </button>
      </div>
    </div>
  )
}
