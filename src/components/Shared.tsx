export function Chequer({ carry, className = '' }: { carry: 'light' | 'dark'; className?: string }) {
  return <div className={`chequer chequer-${carry} ${className}`} aria-hidden="true" />
}

export function Contours({ token }: { token: string }) {
  return <div className="contours" style={{ '--contour': `var(${token})` } as React.CSSProperties} aria-hidden="true" />
}

/* ---------- Corner brackets ---------- */
export const BRACKET_PATH = 'M0 0.5H10V10.5'
export function Brackets({ className = '' }: { className?: string }) {
  const corner = (pos: string, t: string) => (
    <svg className={`bracket bracket-${pos}`} viewBox="0 0 10.5 10.5" style={{ transform: t }} aria-hidden="true">
      <path d={BRACKET_PATH} fill="none" stroke="currentColor" />
    </svg>
  )
  return (
    <span className={`brackets ${className}`} aria-hidden="true">
      {corner('tr', '')}
      {corner('tl', 'scaleX(-1)')}
      {corner('bl', 'scale(-1)')}
      {corner('br', 'scaleY(-1)')}
    </span>
  )
}

/* ---------- Chamfered button ---------- */
export const ARROW_PATH = 'M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553'
export function Arrow() {
  return (
    <svg className="cta-arrow" viewBox="0 0 13.7071 10.7071" aria-hidden="true">
      <path d={ARROW_PATH} fill="none" stroke="currentColor" />
    </svg>
  )
}

export function Chamfer({
  href,
  label,
  w,
  cut,
  variant,
  className = '',
  external,
  onClick,
}: {
  href: string
  label: string
  w: number
  cut: number
  variant: 'solid' | 'hollow'
  className?: string
  external?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  const path = `M0.5 0.5H${w - 0.5}V${50 - cut}L${w - cut} 49.5H0.5Z`
  return (
    <a
      href={href}
      className={`chamfer chamfer-${variant} ${className}`}
      style={{ '--cta-ratio': w / 50 } as React.CSSProperties}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={onClick}
    >
      <svg viewBox={`0 0 ${w} 50`} preserveAspectRatio="none" aria-hidden="true">
        <path className="chamfer-body" d={path} />
        <path className="chamfer-flood" d={path} />
        <path className="chamfer-ring" d={path} />
      </svg>
      <span className="chamfer-label">
        {label}
        <Arrow />
      </span>
    </a>
  )
}

/** Holds timeline media in its desktop position and in the document flow on phones. */
export function Layer({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`parallax ${className}`}>
      <div className="parallax-inner">{children}</div>
    </div>
  )
}
