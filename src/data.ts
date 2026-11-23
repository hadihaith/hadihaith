// Content pulled from LinkedIn (experience, education, certifications)
// and public GitHub repos (projects). Edit here to update the site.

export const LINKS = {
  github: 'https://github.com/hadihaith',
  linkedin: 'https://www.linkedin.com/in/hadihhaidar/',
}

// Pixel art: '.' is an unlit LED; letters map to LED colors.
export const LED: Record<string, string> = {
  p: '#FF5D8F', // pink
  a: '#FFC23D', // amber
  t: '#3ED6C5', // teal
  v: '#8F7BFF', // violet
  w: '#F4F1FF', // white
  r: '#FF7A45', // ember
}

type Frames = string[][]

const shiftDown = (f: string[]) => ['............', ...f.slice(0, -1)]
const swap = (f: string[], a: string, b: string) =>
  f.map((r) => r.replace(new RegExp(`[${a}${b}]`, 'g'), (m) => (m === a ? b : a)))

const rocket = [
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
const rocket2 = [...rocket.slice(0, 9), '.....aa.....', '.....pp.....', '....p..p....']

const zoom = [
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
const zoom2 = zoom.map((r, i) =>
  i === 0 ? '.....w......' : i === 1 ? 'w.........w.' : i === 5 ? 't.awa..t....' : r,
)

const backpack = [
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

const qr = [
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
const qr2 = qr.map((r, i) => (i === 6 ? 'tttttttttttt' : r))

const cap = [
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
const cap2 = cap.map((r, i) =>
  i >= 4 && i <= 7 ? r.slice(0, 9) + (i === 7 ? '.pp' : '..p') : r,
)

const quiz = [
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

const ttt = [
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
const ttt2 = ttt.map((r, i) => (i < 3 || (i > 3 && i < 7) || i > 7 ? r.replace(/p/g, 'a') : r))

export type Project = {
  id: string
  title: string
  when: string
  oneLiner: string
  details: string[]
  stack: string[]
  links: { label: string; href: string }[]
  frames: Frames
  playable?: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'homecoming',
    title: 'Operation: The Great Homecoming',
    when: 'NASA Space Apps 2026',
    oneLiner: 'A Unity story game where you run climate experiments with an alien crew, using real NASA records.',
    details: [
      'Built for the “Be an Earth System Trend Detective” challenge.',
      'The browser companion pulls four decades of NASA data for any place, plots it, and tells you in plain words whether there is a real trend, how fast it moves and whether it is statistically significant (t-test, Mann-Kendall, 95% confidence intervals).',
      'Redeploys itself from main through GitHub Actions.',
    ],
    stack: ['Unity', 'C#', 'TypeScript', 'Python'],
    links: [
      { label: 'Play it online', href: 'https://nasatrenddetective.vercel.app' },
      { label: 'Source', href: 'https://github.com/hadihaith/NasaSpaceApps2026' },
    ],
    frames: [rocket, rocket2],
  },
  {
    id: 'pix',
    title: 'Unofficial Pix Studio',
    when: 'In progress',
    oneLiner: 'An Android app that talks to a Divoom PIX LED backpack over Bluetooth, so you can draw pixel art and animations for it.',
    details: [
      'Scans for the backpack over Bluetooth LE, identifies it by its service UUIDs and inspects its GATT services.',
      'Pixel art and animation editors are next, then sending them to the backpack. The board at the top of this page is a nod to it.',
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Bluetooth LE'],
    links: [{ label: 'Source', href: 'https://github.com/hadihaith/pix-backpack' }],
    frames: [backpack, swap(swap(backpack, 'p', 'a'), 't', 'p')],
  },
  {
    id: 'dlc',
    title: 'DLC Portal',
    when: 'Django web app',
    oneLiner: 'A members portal that runs events end to end: registration, QR-code attendance, dashboards and more.',
    details: [
      'Every event gets its own secret codes and QR codes for start and end attendance, checked against the event’s schedule.',
      'Includes an events dashboard with live attendance counts, bulk member and partner uploads, parking management, exchange applications and a dean’s list.',
      'Migrated from SQLite to PostgreSQL and deployed on Railway.',
    ],
    stack: ['Python', 'Django', 'PostgreSQL', 'JavaScript'],
    links: [{ label: 'Source', href: 'https://github.com/hadihaith/DLCwebsite' }],
    frames: [qr, qr2],
  },
  {
    id: 'nasa25',
    title: 'NASA image explorer',
    when: 'NASA Space Apps 2025',
    oneLiner: 'A Django app that pulls huge NASA images, cuts them into zoomable tiles and lets you label what you find.',
    details: [
      'Management commands search and import NASA imagery, then generate deep-zoom tiles and thumbnails in the background.',
      'Users can pin labels on features and hide or show them.',
    ],
    stack: ['Python', 'Django', 'NASA APIs'],
    links: [{ label: 'Source', href: 'https://github.com/hadihaith/Nasa-Space-Apps' }],
    frames: [zoom, zoom2],
  },
  {
    id: 'salman',
    title: 'Dr. Salman Aljazzaf’s website',
    when: 'Astro site',
    oneLiner: 'An academic website for a Kuwait University professor.',
    details: ['A fast static site built with Astro to present Dr. Aljazzaf’s academic profile and work.'],
    stack: ['Astro', 'TypeScript', 'CSS'],
    links: [{ label: 'Source', href: 'https://github.com/hadihaith/SalmanAljazzaf' }],
    frames: [cap, cap2],
  },
  {
    id: 'cip',
    title: 'Programming quiz game',
    when: 'Stanford Code in Place',
    oneLiner: 'A terminal quiz on programming topics, with player accounts saved to a database.',
    details: [
      'Validates names and question counts, stores players in SQLite and uses regular expressions to read yes-or-no answers.',
      'Questions are drawn at random without repeats, and there is a bonus round at the end.',
    ],
    stack: ['Python', 'SQLite'],
    links: [{ label: 'Source', href: 'https://github.com/hadihaith/Standford-University-Code-In-Place-Project' }],
    frames: [quiz, shiftDown(quiz)],
  },
  {
    id: 'ttt',
    title: 'TicTacToe',
    when: 'Codecademy CS portfolio',
    oneLiner: 'The classic, first written in Python. This one runs right here, so go ahead and play.',
    details: [],
    stack: ['Python'],
    links: [{ label: 'Python source', href: 'https://github.com/hadihaith/TicTacToe' }],
    frames: [ttt, ttt2],
    playable: true,
  },
]

export type Cert = { title: string; issuer: string; date: string; note: string; href: string; color: string }

// Oldest first: this is the order they were unlocked.
export const CERTS: Cert[] = [
  { title: 'CS50P: Introduction to Programming with Python', issuer: 'Harvard CS50', date: 'Apr 2024', note: 'Picked up Python.', href: 'https://certificates.cs50.io/8a51a41e-0784-45f0-9ed0-1361df23a1ed.pdf?size=letter', color: LED.p },
  { title: 'Responsive Web Design', issuer: 'freeCodeCamp', date: 'May 2024', note: 'Made layouts behave on every screen.', href: 'https://freecodecamp.org/certification/hadihaith/responsive-web-design', color: LED.t },
  { title: 'CS106A: Programming Methodology', issuer: 'Stanford Code in Place', date: 'Jun 2024', note: 'Shipped the quiz game above.', href: 'https://codeinplace.stanford.edu/cip4/certificate/yk8404', color: LED.r },
  { title: 'CS50x: Introduction to Computer Science', issuer: 'Harvard CS50', date: 'Aug 2024', note: 'C, memory, algorithms and the web.', href: 'https://cs50.harvard.edu/certificates/5b6b7d17-0ded-41e1-8756-a12066fbbdbb', color: LED.p },
  { title: 'JavaScript Algorithms and Data Structures', issuer: 'freeCodeCamp', date: 'Aug 2024', note: 'Algorithms, in JavaScript.', href: 'https://freecodecamp.org/certification/hadihaith/javascript-algorithms-and-data-structures-v8', color: LED.t },
  { title: 'C++ Fundamentals', issuer: 'Codecademy', date: 'Sep 2024', note: 'Survived pointers.', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/b74a2390dfc4127fa5d43fe147425ad0', color: LED.v },
  { title: 'CS50W: Web Programming with Python and JavaScript', issuer: 'Harvard CS50', date: 'Jan 2025', note: 'Django and JavaScript, start to finish.', href: 'https://cs50.harvard.edu/certificates/e8c4467b-a257-4f1b-a890-b43232a11489', color: LED.p },
  { title: 'Machine Learning and Data Foundations for AI', issuer: 'Codecademy', date: 'Apr 2025', note: 'Regression, linear algebra and data for AI.', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/5701108f64cd4a02981c161085ccc50e', color: LED.v },
  { title: 'Bloomberg Finance Fundamentals', issuer: 'Bloomberg', date: 'May 2026', note: 'Corporate finance, from the terminal people.', href: 'https://portal.bloombergforeducation.com/certificates/wfiELu3wSGLDPoy4Jwhfy3uU', color: LED.a },
]

export const TROPHY = [
  '............',
  '.cccccccccc.',
  'c.cccccccc.c',
  'c.cccccccc.c',
  '.c.cccccc.c.',
  '...cccccc...',
  '....cccc....',
  '.....cc.....',
  '.....cc.....',
  '....cccc....',
  '...cccccc...',
  '............',
]

export type Quest = { when: string; title: string; where: string; text: string; color: string; ongoing?: boolean }

export const QUESTS: Quest[] = [
  { when: 'Sep 2023', title: 'Started a degree in Management Information Systems', where: 'Kuwait University', text: 'Where business meets software. Still going.', color: LED.t, ongoing: true },
  { when: 'May 2024', title: 'Became an MIS instructor', where: 'Baims', text: 'Teaching programming and tech subjects to other students.', color: LED.v, ongoing: true },
  { when: 'Dec 2024', title: 'Started teaching statistics too', where: 'Baims', text: 'Estimating population parameters, hypothesis testing and quality assurance, and regression.', color: LED.a, ongoing: true },
  { when: 'Feb 2025', title: 'Research assistant for a semester', where: 'Kuwait University', text: 'Research work in Python, February to May 2025.', color: LED.p },
  { when: 'Jan 2026', title: 'Exchange semester in France', where: 'Rennes School of Business', text: 'International finance specialization, January to June 2026.', color: LED.r },
]

export const LOADOUT = [
  'Python', 'Django', 'JavaScript', 'TypeScript', 'React', 'Astro',
  'C++', 'C#', 'Unity', 'Kotlin', 'PostgreSQL', 'Git & Docker',
]
