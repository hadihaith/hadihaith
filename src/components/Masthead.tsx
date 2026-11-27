import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Rise } from '../engine/Reveal'
import { ITEM, SHEET, Spring } from '../engine/spring'
import { lenis } from '../engine/ticker'
import { LINKS, NAV } from '../data'
import { follow, url, useRoute } from '../router'

const isCurrent = (href: string, route: string) => href === route

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href={url('/')}
      className="logo"
      aria-label="Hadi Haidar, home"
      onClick={(e) => {
        onClick?.()
        follow('/', e)
      }}
    >
      <span className="logo-mark" aria-hidden="true">HH</span>
      <span className="logo-word" aria-hidden="true">hadihaith</span>
    </a>
  )
}

function Sheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const route = useRoute()
  useEffect(() => {
    const el = ref.current!
    const s = new Spring(0, SHEET, (v) => (el.style.opacity = String(v)))
    s.to(1)
    lenis?.stop()
    document.documentElement.classList.add('locked')
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const mq = window.matchMedia('(min-width: 1280px)')
    const onMq = () => mq.matches && onClose()
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      s.stop()
      lenis?.start()
      document.documentElement.classList.remove('locked')
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [onClose])
  const items = [...NAV, { label: 'github', href: LINKS.github }]
  return createPortal(
    <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label="Menu" style={{ opacity: 0 }}>
      <div className="sheet-top">
        <Logo onClick={onClose} />
        <button ref={close} type="button" className="sheet-close" aria-label="Close menu" onClick={onClose}>
          <span />
          <span />
        </button>
      </div>
      <nav className="sheet-nav" aria-label="Primary">
        <ul>
          {items.map((l, i) => (
            <Rise as="li" key={l.label} enabled delay={120 + i * 55} config={ITEM} y="0.75rem">
              <a
                href={l.href.startsWith('http') ? l.href : url(l.href)}
                aria-current={isCurrent(l.href, route) ? 'page' : undefined}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onClick={(e) => {
                  if (l.href.startsWith('http')) return
                  e.preventDefault()
                  onClose()
                  requestAnimationFrame(() => follow(l.href))
                }}
              >
                {l.label}
              </a>
            </Rise>
          ))}
        </ul>
      </nav>
    </div>,
    document.body,
  )
}

/** The site's masthead: logo, the nav on the page's centre line, GitHub, and the menu below xl. */
export default function Masthead({ enabled }: { enabled?: boolean }) {
  const [menu, setMenu] = useState(false)
  const route = useRoute()
  return (
    <>
      <Rise as="header" className="masthead" enabled={enabled} delay={0} y="1.25rem">
        <Logo />
        <nav className="masthead-nav" aria-label="Primary">
          <ul>
            {NAV.map((l) => (
              <li key={l.label}>
                <a href={url(l.href)} aria-current={isCurrent(l.href, route) ? 'page' : undefined} onClick={(e) => follow(l.href, e)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="masthead-garage" href={LINKS.github} target="_blank" rel="noreferrer">
          <span aria-hidden="true">[ </span>github<span aria-hidden="true"> → ]</span>
        </a>
        <button type="button" className="burger" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}>
          <span />
          <span />
        </button>
      </Rise>
      {menu && <Sheet onClose={() => setMenu(false)} />}
    </>
  )
}
