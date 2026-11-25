// Pixel art for the LED screens: '.' is an unlit LED; letters map to LED colours.
// Monochrome on purpose: the site's one accent, a bright mix of it, white and steel.
export const LED: Record<string, string> = {
  p: '#02d2e3', // accent
  t: '#8df3fa', // accent, lifted toward white
  a: '#ffffff',
  w: '#ffffff',
  v: '#b6c1c8', // steel
  r: '#02d2e3',
}

export type Frames = string[][]

export const shiftDown = (f: string[]) => ['............', ...f.slice(0, -1)]
export const swap = (f: string[], a: string, b: string) =>
  f.map((r) => r.replace(new RegExp(`[${a}${b}]`, 'g'), (m) => (m === a ? b : a)))

export const rocket = [
  '.....ww.....',
  '....wwww....',
  '....wttw....',
  '....wttw....',
  '....wwww....',
  '...vwwwwv...',
  '..vvwwwwvv..',
  '..v.wwww.v..',
  '.....aa.....',
  '....aaaa....',
  '....pppp....',
  '.....pp.....',
]
export const rocket2 = [...rocket.slice(0, 9), '.....aa.....', '.....pp.....', '....p..p....']

export const zoom = [
  'w.........w.',
  '....w.......',
  '..tttt...w..',
  '.t....t.....',
  't..a...t....',
  't.aaa..t..w.',
  't..a...t....',
  '.t....t.....',
  '..tttttv....',
  '.......vv...',
  '........vv..',
  '.........vv.',
]
export const zoom2 = zoom.map((r, i) =>
  i === 0 ? '.....w......' : i === 1 ? 'w.........w.' : i === 5 ? 't.awa..t....' : r,
)

export const backpack = [
  '....vvvv....',
  '...v....v...',
  '..vvvvvvvv..',
  '.vv......vv.',
  '.v.pp..aa.v.',
  '.v.pp..aa.v.',
  '.v.tt..pp.v.',
  '.v.tt..pp.v.',
  '.v........v.',
  '.vvvvvvvvvv.',
  '.vv......vv.',
  '.vvvvvvvvvv.',
]

export const qr = [
  'wwww.w..wwww',
  'w..w..w.w..w',
  'w..w.w..w..w',
  'wwww.ww.wwww',
  '....w..w....',
  'w.ww.w.ww.w.',
  '.w..ww...w.w',
  '....w.w.w...',
  'wwww..ww.w.w',
  'w..w.w..ww..',
  'w..w..w.w.w.',
  'wwww.w.ww..w',
]
export const qr2 = qr.map((r, i) => (i === 6 ? 'tttttttttttt' : r))

export const cap = [
  '............',
  '.....aa.....',
  '...aaaaaa...',
  '.aaaaaaaaaa.',
  '...aaaaaa.p.',
  '...vvvvvv.p.',
  '...vvvvvv.p.',
  '....vvvv.pp.',
  '............',
  '..wwwwwwww..',
  '............',
  '..wwwww.....',
]
export const cap2 = cap.map((r, i) =>
  i >= 4 && i <= 7 ? r.slice(0, 9) + (i === 7 ? '.pp' : '..p') : r,
)

export const quiz = [
  '....pppp....',
  '...pp..pp...',
  '...pp..pp...',
  '.......pp...',
  '......pp....',
  '.....pp.....',
  '.....pp.....',
  '............',
  '.....pp.....',
  '.....pp.....',
  '............',
  '............',
]

export const ttt = [
  'p.pvtttv....',
  '.p.vt.tv....',
  'p.pvtttv....',
  'vvvvvvvvvvv.',
  '...vp.pv....',
  '...v.p.v....',
  '...vp.pv....',
  'vvvvvvvvvvv.',
  'tttv...vp.p.',
  't.tv...v.p..',
  'tttv...vp.p.',
  '............',
]
export const ttt2 = ttt.map((r, i) => (i < 3 || (i > 3 && i < 7) || i > 7 ? r.replace(/p/g, 'a') : r))

export const plane = [
  '............',
  '.....pp.....',
  '.....pp.....',
  '....pppp....',
  '...wwwwww...',
  '.wwwwwwwwww.',
  'wwww.pp.wwww',
  '.....pp.....',
  '.....pp.....',
  '....wwww....',
  '...ww..ww...',
  '............',
]
export const plane2 = plane.map((r, i) => (i === 1 || i === 2 ? r.replace(/p/g, 't') : r))

export const bars = [
  '............',
  '.........pp.',
  '.........pp.',
  '......tt.pp.',
  '......tt.pp.',
  '...ww.tt.pp.',
  '...ww.tt.pp.',
  'p..ww.tt.pp.',
  'p..ww.tt.pp.',
  'p..ww.tt.pp.',
  'vvvvvvvvvvvv',
  '............',
]
export const bars2 = shiftDown(bars).map((r, i) => (i === 11 ? 'vvvvvvvvvvvv' : i === 10 ? r.replace(/v/g, '.') : r))

export const terminal = [
  'vvvvvvvvvvvv',
  'v..........v',
  'v.p........v',
  'v..p.......v',
  'v...p......v',
  'v..p.......v',
  'v.p..wwww..v',
  'v..........v',
  'v..........v',
  'vvvvvvvvvvvv',
  '....vvvv....',
  '..vvvvvvvv..',
]
export const terminal2 = terminal.map((r, i) => (i === 6 ? 'v.p........v' : r))
