import { useEffect, useRef, useState } from 'react'
import { Rise } from '../engine/Reveal'
import { REVEAL } from '../engine/spring'
import { Brackets } from './Shared'
import portrait from '../media/portrait.jpg'

/**
 * The official portrait, framed in the site's corner brackets. The photo was
 * edited with AI, and says so: the "AI" chip shows a note on hover, on
 * keyboard focus, or on a tap (touch has no hover).
 */
export default function Portrait({ delay = 0 }: { delay?: number }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLElement>(null)

  // A tap anywhere else, or Escape, puts the note away.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <Rise className="portrait-rise" delay={delay} y="1.25rem" config={REVEAL} enabled>
      <figure ref={root} className="portrait">
        <div className="portrait-frame">
          <img src={portrait} width={768} height={1024} alt="Portrait of Hadi Haidar (AI-edited photo)" decoding="async" />
        </div>
        <Brackets />
        <button
          type="button"
          className={`portrait-ai${open ? ' is-open' : ''}`}
          aria-describedby="portrait-ai-note"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">AI</span>
          <span className="sr-only">About this photo</span>
        </button>
        <span id="portrait-ai-note" role="tooltip" className="portrait-note">
          This portrait was edited with AI.
        </span>
      </figure>
    </Rise>
  )
}
