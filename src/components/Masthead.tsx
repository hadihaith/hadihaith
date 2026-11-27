import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LINKS, NAV } from '../data'
import { url, useRoute } from '../router'

const isCurrent = (href: string, route: string) => href === route

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href={url('/')}
      className="logo"
      aria-label="Hadi Haidar, home"
      onClick={onClick}
    >
      <span className="logo-mark" aria-hidden="true">HH</span>
      <span className="logo-word" aria-hidden="true">hadihaith</span>
    </a>
  )
}

function Sheet({ onClose }: { onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  const route = useRoute()
  useEffect(() => {
    document.documentElement.classList.add('locked')
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const mq = window.matchMedia('(min-width: 1280px)')
    const onMq = () => mq.matches && onClose()
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      document.documentElement.classList.remove('locked')
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [onClose])
  const items = [...NAV, { label: 'github', href: LINKS.github }]
  return createPortal(
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="sheet-top">
        <Logo onClick={onClose} />
        <button ref={close} type="button" className="sheet-close" aria-label="Close menu" onClick={onClose}>
          <span />
          <span />
        </button>
      </div>
      <nav className="sheet-nav" aria-label="Primary">
        <ul>
          {items.map((l) => (
            <li key={l.label}>
              <a
                href={l.href.startsWith('http') ? l.href : url(l.href)}
                aria-current={isCurrent(l.href, route) ? 'page' : undefined}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onClick={l.href.startsWith('http') ? undefined : onClose}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>,
    document.body,
  )
}

/** The site's masthead: logo, the nav on the page's centre line, GitHub, and the menu below xl. */
export default function Masthead() {
  const [menu, setMenu] = useState(false)
  const route = useRoute()
  return (
    <>
      <header className="masthead">
        <Logo />
        <nav className="masthead-nav" aria-label="Primary">
          <ul>
            {NAV.map((l) => (
              <li key={l.label}>
                <a href={url(l.href)} aria-current={isCurrent(l.href, route) ? 'page' : undefined}>
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
      </header>
      {menu && <Sheet onClose={() => setMenu(false)} />}
    </>
  )
}
