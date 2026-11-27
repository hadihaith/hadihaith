import { subscribe } from './ticker'

/** react-spring's damped spring (mass 1), or a plain tween when given a duration. */
export type SpringConfig = { tension: number; friction: number } | { duration: number; easing?: (t: number) => number }

export const REVEAL = { tension: 90, friction: 26 }
export const ROW = { tension: 170, friction: 24 }
export const ITEM = ROW
export const SHEET = { tension: 190, friction: 26 }
export const FIGURE = { tension: 200, friction: 24 }
export const TYPE = { tension: 210, friction: 24 }
export const YEAR = { tension: 190, friction: 24 }
export const COPY = { tension: 110, friction: 26 }
export const COPY_FAST = { tension: 150, friction: 24 }
export const NAME = { tension: 190, friction: 24 }
export const LABEL = { tension: 110, friction: 26 }
export const YEAR_SETTLE = { tension: 32, friction: 26 }
export const TRIGGER = { tension: 140, friction: 30 }

const PRECISION = 0.001
const active = new Set<Spring>()
let unsub: (() => void) | null = null

const tick = (now: number) => {
  for (const s of [...active]) s.advance(now)
  if (!active.size && unsub) {
    unsub()
    unsub = null
  }
}

export class Spring {
  value: number
  velocity = 0
  target: number
  private cfg: SpringConfig
  private startAt = 0
  private last = 0
  private tweenFrom = 0
  private tweenStart = 0
  constructor(
    initial: number,
    cfg: SpringConfig,
    private onChange: (v: number) => void,
  ) {
    this.value = initial
    this.target = initial
    this.cfg = cfg
  }

  to(target: number, delay = 0, cfg?: SpringConfig) {
    if (cfg) this.cfg = cfg
    this.target = target
    const now = performance.now()
    this.startAt = now + delay
    this.last = 0
    this.tweenFrom = this.value
    this.tweenStart = this.startAt
    if (Math.abs(target - this.value) < PRECISION && Math.abs(this.velocity) < PRECISION) {
      this.value = target
      this.onChange(target)
      active.delete(this)
      return
    }
    active.add(this)
    if (!unsub) unsub = subscribe(tick)
  }

  set(value: number) {
    this.value = this.target = value
    this.velocity = 0
    active.delete(this)
    this.onChange(value)
  }

  stop() {
    active.delete(this)
  }

  advance(now: number) {
    if (now < this.startAt) return
    const cfg = this.cfg
    if ('duration' in cfg) {
      const t = Math.min(1, (now - this.tweenStart) / Math.max(1, cfg.duration))
      const e = cfg.easing ? cfg.easing(t) : t
      this.value = this.tweenFrom + (this.target - this.tweenFrom) * e
      this.onChange(this.value)
      if (t >= 1) active.delete(this)
      return
    }
    if (!this.last) this.last = now - 16
    const frame = Math.min(64, now - this.last)
    this.last = now
    let { value, velocity } = this
    for (let i = 0; i < Math.ceil(frame); i++) {
      const spring = -cfg.tension * 0.000001 * (value - this.target)
      const damping = -cfg.friction * 0.001 * velocity
      velocity += spring + damping
      value += velocity
    }
    this.value = value
    this.velocity = velocity
    if (Math.abs(velocity) < PRECISION && Math.abs(this.target - value) < PRECISION) {
      this.value = this.target
      this.velocity = 0
      active.delete(this)
    }
    this.onChange(this.value)
  }
}

export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t)
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
