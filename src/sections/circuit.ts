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

export const CUMULATIVE = CIRCUIT_PATH.reduce<number[]>((acc, point, index) => {
  if (index === 0) return [0]
  const previous = CIRCUIT_PATH[index - 1]
  acc.push(acc[index - 1] + Math.hypot(point[0] - previous[0], point[1] - previous[1]))
  return acc
}, [])
export const TOTAL = CUMULATIVE[CUMULATIVE.length - 1]

const CORNER_BRAKE = 9
const TIME_AT = (() => {
  const count = CIRCUIT_PATH.length
  const turn = new Array(count).fill(0)
  for (let i = 1; i < count - 1; i += 1) {
    const [ax, ay] = CIRCUIT_PATH[i - 1], [bx, by] = CIRCUIT_PATH[i], [cx, cy] = CIRCUIT_PATH[i + 1]
    const ux = bx - ax, uy = by - ay, vx = cx - bx, vy = cy - by
    const lengths = (Math.hypot(ux, uy) || 1) * (Math.hypot(vx, vy) || 1)
    turn[i] = Math.acos(Math.min(1, Math.max(-1, (ux * vx + uy * vy) / lengths)))
  }
  const win = 6
  const smoothed = turn.map((_, i) => {
    let sum = 0, n = 0
    for (let j = Math.max(0, i - win); j <= Math.min(count - 1, i + win); j += 1) { sum += turn[j]; n += 1 }
    return sum / n
  })
  const accumulated = [0]
  for (let i = 1; i < count; i += 1) {
    const span = CUMULATIVE[i] - CUMULATIVE[i - 1]
    const speed = 1 / (1 + CORNER_BRAKE * smoothed[i])
    accumulated.push(accumulated[i - 1] + span / speed)
  }
  const total = accumulated[count - 1] || 1
  return accumulated.map((v) => v / total)
})()

export const distanceAtTime = (time: number) => {
  if (time <= 0) return 0
  if (time >= 1) return TOTAL
  let low = 0, high = TIME_AT.length - 1
  while (low < high - 1) {
    const mid = (low + high) >> 1
    if (TIME_AT[mid] <= time) low = mid
    else high = mid
  }
  const span = TIME_AT[high] - TIME_AT[low] || 1
  const ratio = (time - TIME_AT[low]) / span
  return CUMULATIVE[low] + (CUMULATIVE[high] - CUMULATIVE[low]) * ratio
}

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
export const DOT_LATTICE = { pitchX: 4.383, pitchY: 4.327, originX: 2.81, originY: 11.6 }
export const DOT_RADIUS = 0.98

/**
 * The landmass, as runs of lit lattice columns per row: "rowDelta:gap+len,gap+len;...".
 * Generated once from three octaves of value noise (top 14% of the field) and
 * shipped as data, so the page never spends a frame on noise maths. 8,332 dots
 * in about 1.5KB of source.
 */
const PACKED =
  "33:99+4;1:96+9;1:94+13,9+4;1:93+18,1+10;1:92+32;1:92+34;1:91+37;1:91+46;1:91+48,40+5;1:91+50,34+9;1:91+51,29+14;1:91+53,8+7,10+16;1:90+57,1+13,6+19;1:90+96;1:22+6,62+96;1:19+11,60+97;1:16+15,58+98;1:14+18,57+98;1:13+19,57+99;1:12+20,56+100;1:11+21,56+100;1:11+22,55+100;1:10+22,55+101,49+1;1:9+23,55+101,47+4;1:8+24,55+101,47+5;1:8+24,55+101,47+5;1:8+23,55+102;1:10+20,56+102;1:12+14,60+102;1:0+6,10+4,65+88,2+13;1:0+7,78+87,4+12;1:0+7,78+86,6+11,56+4;1:0+8,76+86,8+9,57+5;1:0+9,74+86,10+7,57+7;1:0+10,71+87,13+2,60+6;1:0+10,67+90,75+6;1:0+11,63+92,73+5;1:0+11,61+92,71+8;1:0+11,60+76,87+9;1:0+11,58+76,88+10;1:0+11,57+76,89+9;1:0+11,56+76,91+8;1:0+11,55+77,92+6;1:0+11,55+77;1:0+12,54+78;1:0+12,53+79;1:0+12,53+80;1:0+13,51+84;1:0+13,51+85;1:0+13,50+87;1:0+12,51+87;1:0+11,51+88;1:0+9,52+57,5+27;1:60+57,9+24;1:60+56,17+17;1:58+57,20+15;1:57+57,23+13;1:55+58,26+11;1:47+65,28+10;1:43+68,30+9;1:41+69,32+8;1:39+71,34+6;1:36+74,35+5;1:30+80;1:29+81;1:29+81,43+1;1:28+82,42+5;1:28+82,42+6;1:28+82,42+6;1:28+82,42+6;1:28+82,43+3;1:28+81;1:28+81;1:29+80;1:29+79;1:29+78;1:30+76;1:30+73;1:31+60;1:32+58;1:33+56;1:33+56;1:33+55;1:33+54;1:32+54;1:32+52;1:33+48;1:33+46;1:33+45;1:34+31,3+7;1:35+29;1:35+28;1:36+26;1:37+25;1:38+23;1:39+2,4+16;1:47+13;1:47+13;1:48+11;1:48+11;1:49+8;21:118+3;1:117+5;1:116+7;1:115+8;1:115+9;1:114+11;1:113+13;1:112+16;1:110+21;1:108+24;1:107+25;1:106+27;1:105+28;1:105+28;1:104+29;1:104+29;1:103+31;1:103+31;1:102+32;1:101+33;1:101+34;1:101+34;1:100+35;1:100+35;1:100+35;1:100+36;1:101+35;1:101+35,173+2"

export type DotField = { points: Float32Array; columns: Int16Array; rows: Int16Array; count: number }

let dots: DotField | null = null
/** Decoded on first use, not at import. */
export const getDots = (): DotField => (dots ??= decodeDots())

const decodeDots = (): DotField => {
  const xs: number[] = [], cs: number[] = [], rs: number[] = []
  let j = 0
  for (const row of PACKED.split(';')) {
    const [head, body] = row.split(':')
    j += Number(head)
    let i = 0
    for (const run of body.split(',')) {
      const [gap, len] = run.split('+').map(Number)
      i += gap
      for (let k = 0; k < len; k++, i++) {
        xs.push(DOT_LATTICE.originX + i * DOT_LATTICE.pitchX, DOT_LATTICE.originY + j * DOT_LATTICE.pitchY)
        cs.push(i)
        rs.push(j)
      }
    }
  }
  return { points: Float32Array.from(xs), columns: Int16Array.from(cs), rows: Int16Array.from(rs), count: cs.length }
}
