/**
 * The season circuit, in the block's 1440x800 artboard. Authored here as a
 * handful of corners and run through a closed Catmull-Rom spline, then
 * resampled at a fixed step so the lap can be paced off its own curvature.
 */
export type Point = readonly [number, number]

const CORNERS: Point[] = [
  [900, 640], [720, 640], [600, 628], [535, 580], [520, 500], [560, 430],
  [640, 400], [690, 340], [660, 270], [690, 195], [770, 170], [900, 185],
  [1050, 170], [1180, 150], [1270, 175], [1300, 240], [1250, 300], [1150, 320],
  [1100, 370], [1160, 420], [1290, 440], [1340, 500], [1320, 590], [1240, 640],
  [1080, 648],
]

export const CIRCUIT_STEP = 3

const spline = (pts: Point[]) => {
  const out: [number, number][] = []
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    for (let k = 0; k < 40; k++) {
      const t = k / 40, t2 = t * t, t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push([pts[0][0], pts[0][1]])
  return out
}

const resample = (dense: [number, number][], step: number) => {
  const out: [number, number][] = [dense[0]]
  let carry = 0
  for (let i = 1; i < dense.length; i++) {
    let [ax, ay] = dense[i - 1]
    const [bx, by] = dense[i]
    let seg = Math.hypot(bx - ax, by - ay)
    while (carry + seg >= step) {
      const r = (step - carry) / seg
      ax += (bx - ax) * r
      ay += (by - ay) * r
      out.push([ax, ay])
      seg = Math.hypot(bx - ax, by - ay)
      carry = 0
    }
    carry += seg
  }
  out.push([dense[0][0], dense[0][1]])
  return out
}

export const CIRCUIT_PATH: Point[] = resample(spline(CORNERS), CIRCUIT_STEP)

const CUMULATIVE = CIRCUIT_PATH.reduce<number[]>((acc, point, index) => {
  if (index === 0) return [0]
  const previous = CIRCUIT_PATH[index - 1]
  acc.push(acc[index - 1] + Math.hypot(point[0] - previous[0], point[1] - previous[1]))
  return acc
}, [])

const nearest = (x: number, y: number) => {
  let best = 0, bd = Infinity
  CIRCUIT_PATH.forEach(([px, py], i) => {
    const d = Math.hypot(px - x, py - y)
    if (d < bd) { bd = d; best = i }
  })
  return best
}

/**
 * The certificates the lap passes, in the order they were earned. Labels sit
 * off the line: inside the loop on the left, where the copy column is.
 */
export const CIRCUIT_MARKERS = (
  [
    { at: [640, 636], dx: 0, dy: 26, anchor: 'middle' },
    { at: [521, 515], dx: 20, dy: 0, anchor: 'start' },
    { at: [610, 412], dx: 14, dy: 24, anchor: 'start' },
    { at: [690, 195], dx: -16, dy: -14, anchor: 'end' },
    { at: [960, 180], dx: 0, dy: -24, anchor: 'middle' },
    { at: [1300, 240], dx: -20, dy: 0, anchor: 'end' },
    { at: [1100, 370], dx: -20, dy: 0, anchor: 'end' },
    { at: [1340, 500], dx: -20, dy: 0, anchor: 'end' },
    { at: [1180, 646], dx: 0, dy: 26, anchor: 'middle' },
  ] as const
).map((m) => {
  const i = nearest(m.at[0], m.at[1])
  return { x: CIRCUIT_PATH[i][0], y: CIRCUIT_PATH[i][1], d: CUMULATIVE[i], dx: m.dx, dy: m.dy, anchor: m.anchor }
})

/** The flag: where the lap starts and ends, and the track's heading there. */
export const FLAG = (() => {
  const [x, y] = CIRCUIT_PATH[0]
  const [nx, ny] = CIRCUIT_PATH[4]
  return { x, y, angle: (Math.atan2(ny - y, nx - x) * 180) / Math.PI }
})()

export const TRACK_D = 'M' + CIRCUIT_PATH.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')

/** The lap's bounding box, padded 46, what a narrow screen fits to its width. */
export const TRACK_BOX = (() => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of CIRCUIT_PATH) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  return { x: minX - 46, y: minY - 46, width: maxX - minX + 92, height: maxY - minY + 92 }
})()

/* ---------- The halftone landmass ---------- */
