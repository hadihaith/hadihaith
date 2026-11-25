// Content pulled from LinkedIn (experience, education, certifications)
// and public GitHub repos (projects). Edit here to update the site.
import * as px from './pixels'

export const LINKS = {
  github: 'https://github.com/hadihaith',
}

/** '#/route' links are pages; plain '#anchor' links are sections of the home page. */
export const NAV = [
  { label: 'projects', href: '#workshop' },
  { label: 'season', href: '#season' },
  { label: 'journey', href: '#/journey' },
  { label: 'gallery', href: '#/gallery' },
  { label: 'contact', href: '#contact' },
]

export type Project = {
  id: string
  /** Short name for the strip. */
  short: string
  title: string
  /** Strip date line. */
  date: string
  report: string
  stack: string[]
  stats: { label: string; value: string; icon: 'flag' | 'bars' | 'trophy' | 'gauge' }[]
  links: { label: string; href: string }[]
  frames: string[][]
  playable?: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'homecoming',
    short: 'homecoming',
    title: 'Operation: The Great Homecoming',
    date: 'oct 2026',
    report:
      'A Unity story game for NASA Space Apps 2026: run climate experiments with an alien crew, then a browser companion that reads four decades of NASA data and says in plain words whether the trend is real.',
    stack: ['Unity', 'C#', 'TypeScript', 'Python'],
    stats: [
      { label: 'event', value: 'NASA', icon: 'flag' },
      { label: 'stack', value: '4', icon: 'bars' },
      { label: 'status', value: 'Live', icon: 'trophy' },
      { label: 'years of data', value: '40', icon: 'gauge' },
    ],
    links: [
      { label: 'play it online', href: 'https://nasatrenddetective.vercel.app' },
      { label: 'source', href: 'https://github.com/hadihaith/NasaSpaceApps2026' },
    ],
    frames: [px.rocket, px.rocket2],
  },
  {
    id: 'pix',
    short: 'pix studio',
    title: 'Unofficial Pix Studio',
    date: 'in progress',
    report:
      'An Android app that talks to a Divoom PIX LED backpack over Bluetooth LE: it finds the backpack, reads its services, and is growing pixel art and animation editors to send to it.',
    stack: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Bluetooth LE'],
    stats: [
      { label: 'platform', value: 'Android', icon: 'flag' },
      { label: 'stack', value: '4', icon: 'bars' },
      { label: 'status', value: 'WIP', icon: 'trophy' },
      { label: 'firmware', value: '2.4', icon: 'gauge' },
    ],
    links: [{ label: 'view source', href: 'https://github.com/hadihaith/pix-backpack' }],
    frames: [px.backpack, px.swap(px.swap(px.backpack, 'p', 'a'), 't', 'p')],
  },
  {
    id: 'dlc',
    short: 'dlc portal',
    title: 'DLC Portal',
    date: 'django app',
    report:
      'The Dean’s List Council’s website, built end to end while I was its Secretary General: QR-code attendance with per-event secret codes, a live events dashboard, bulk uploads, parking management and exchange applications.',
    stack: ['Python', 'Django', 'PostgreSQL', 'JavaScript'],
    stats: [
      { label: 'framework', value: 'Django', icon: 'flag' },
      { label: 'stack', value: '4', icon: 'bars' },
      { label: 'status', value: 'Live', icon: 'trophy' },
      { label: 'database', value: 'PG', icon: 'gauge' },
    ],
    links: [{ label: 'view source', href: 'https://github.com/hadihaith/DLCwebsite' }],
    frames: [px.qr, px.qr2],
  },
  {
    id: 'nasa25',
    short: 'nasa explorer',
    title: 'NASA image explorer',
    date: 'oct 2025',
    report:
      'Built at NASA Space Apps 2025: a Django app that pulls huge NASA images, cuts them into deep-zoom tiles in the background, and lets people pin labels on what they find.',
    stack: ['Python', 'Django', 'NASA APIs'],
    stats: [
      { label: 'event', value: 'NASA', icon: 'flag' },
      { label: 'stack', value: '3', icon: 'bars' },
      { label: 'status', value: 'Done', icon: 'trophy' },
      { label: 'year', value: '2025', icon: 'gauge' },
    ],
    links: [{ label: 'view source', href: 'https://github.com/hadihaith/Nasa-Space-Apps' }],
    frames: [px.zoom, px.zoom2],
  },
  {
    id: 'salman',
    short: 'aljazzaf site',
    title: 'Dr. Salman Aljazzaf’s website',
    date: 'astro site',
    report: 'A fast static academic website for a Kuwait University professor, built with Astro to present his profile and work.',
    stack: ['Astro', 'TypeScript', 'CSS'],
    stats: [
      { label: 'framework', value: 'Astro', icon: 'flag' },
      { label: 'stack', value: '3', icon: 'bars' },
      { label: 'status', value: 'Live', icon: 'trophy' },
      { label: 'pages', value: 'Static', icon: 'gauge' },
    ],
    links: [{ label: 'view source', href: 'https://github.com/hadihaith/SalmanAljazzaf' }],
    frames: [px.cap, px.cap2],
  },
  {
    id: 'cip',
    short: 'quiz game',
    title: 'Programming quiz game',
    date: 'jun 2024',
    report:
      'My Stanford Code in Place final project: a terminal quiz on programming topics with player accounts in SQLite, random questions without repeats, and a bonus round.',
    stack: ['Python', 'SQLite'],
    stats: [
      { label: 'course', value: 'CS106A', icon: 'flag' },
      { label: 'stack', value: '2', icon: 'bars' },
      { label: 'status', value: 'Done', icon: 'trophy' },
      { label: 'max questions', value: '10', icon: 'gauge' },
    ],
    links: [{ label: 'view source', href: 'https://github.com/hadihaith/Standford-University-Code-In-Place-Project' }],
    frames: [px.quiz, px.shiftDown(px.quiz)],
  },
  {
    id: 'ttt',
    short: 'tictactoe',
    title: 'TicTacToe',
    date: 'playable',
    report: 'The classic, first written in Python for Codecademy’s CS portfolio. This one runs on the screen beside you, so take a turn.',
    stack: ['Python', 'TypeScript'],
    stats: [
      { label: 'course', value: 'CS', icon: 'flag' },
      { label: 'stack', value: '2', icon: 'bars' },
      { label: 'status', value: 'Play', icon: 'trophy' },
      { label: 'squares', value: '9', icon: 'gauge' },
    ],
    links: [{ label: 'python source', href: 'https://github.com/hadihaith/TicTacToe' }],
    frames: [px.ttt, px.ttt2],
    playable: true,
  },
]

export type Cert = { title: string; issuer: string; date: string; href: string }

// Oldest first: the order they were earned.
export const CERTS: Cert[] = [
  { title: 'CS50P: Programming with Python', issuer: 'Harvard CS50', date: 'apr 24', href: 'https://certificates.cs50.io/8a51a41e-0784-45f0-9ed0-1361df23a1ed.pdf?size=letter' },
  { title: 'Responsive Web Design', issuer: 'freeCodeCamp', date: 'may 24', href: 'https://freecodecamp.org/certification/hadihaith/responsive-web-design' },
  { title: 'CS106A: Programming Methodology', issuer: 'Stanford Code in Place', date: 'jun 24', href: 'https://codeinplace.stanford.edu/cip4/certificate/yk8404' },
  { title: 'CS50x: Computer Science', issuer: 'Harvard CS50', date: 'aug 24', href: 'https://cs50.harvard.edu/certificates/5b6b7d17-0ded-41e1-8756-a12066fbbdbb' },
  { title: 'JS Algorithms & Data Structures', issuer: 'freeCodeCamp', date: 'aug 24', href: 'https://freecodecamp.org/certification/hadihaith/javascript-algorithms-and-data-structures-v8' },
  { title: 'C++ Fundamentals', issuer: 'Codecademy', date: 'sep 24', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/b74a2390dfc4127fa5d43fe147425ad0' },
  { title: 'CS50W: Web Programming', issuer: 'Harvard CS50', date: 'jan 25', href: 'https://cs50.harvard.edu/certificates/e8c4467b-a257-4f1b-a890-b43232a11489' },
  { title: 'ML & Data Foundations for AI', issuer: 'Codecademy', date: 'apr 25', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/5701108f64cd4a02981c161085ccc50e' },
  { title: 'Bloomberg Finance Fundamentals', issuer: 'Bloomberg', date: 'may 26', href: 'https://portal.bloombergforeducation.com/certificates/wfiELu3wSGLDPoy4Jwhfy3uU' },
]

/* ---------- The journey page ---------- */

export type PlateMedia =
  | { kind: 'logo'; name: string; label: string }
  | { kind: 'photo'; name: string; label: string; focus?: string }
  | { kind: 'pixels'; frames: string[][]; label: string }

export type TimelineEntry = {
  year: string
  /** centre rows carry copy; side rows are a single plate; scatter rows throw photos around the copy. */
  frame: 'centre' | 'side' | 'scatter'
  align?: 'left' | 'right'
  lead?: string
  copy?: string
  /** A small line under the copy: the role and its dates. */
  meta?: string
  copyWidth?: number
  media: PlateMedia
  scatter?: { name: string; label: string }[]
}

const KU = { kind: 'logo', name: 'logo-ku', label: 'Kuwait University logo' } as const
const BAIMS = { kind: 'logo', name: 'logo-baims', label: 'Baims logo' } as const

export const TIMELINE: TimelineEntry[] = [
  { year: 'sep 23', frame: 'centre', lead: 'Day one.', copy: 'Joined Kuwait University, the base for everything that follows.', meta: 'kuwait university', copyWidth: 240, media: KU },
  { year: 'may 24', frame: 'centre', lead: 'Teaching what I learn.', copy: 'Started teaching programming and tech subjects at Baims, and statistics from December: estimation, testing and regression.', meta: 'instructor · baims · may 2024 to now', copyWidth: 280, media: BAIMS },
  { year: 'feb 25', frame: 'centre', lead: 'Research, in Python.', copy: 'A semester as a research assistant at Kuwait University, doing the analysis work in Python.', meta: 'research assistant · kuwait university · feb to may 2025', copyWidth: 272, media: KU },
  { year: 'may 25', frame: 'centre', lead: 'Giving back.', copy: 'Volunteered as Secretary General of the Dean’s List Council and built its whole site, back end and front end.', meta: 'volunteering · may 2025 to jan 2026', copyWidth: 280, media: { kind: 'logo', name: 'logo-dlc', label: 'Dean’s List Council logo' } },
  { year: 'dec 25', frame: 'centre', lead: 'Third in the gulf.', copy: 'Led the Kuwait University team at the GCC-wide AI+X summit. We built a machine-learning path-finding app and took third place.', meta: 'ai+x horizons summit · 12 to 13 dec 2025', copyWidth: 284, media: { kind: 'photo', name: 'aix-team', label: 'The Kuwait University team holding the third-place cheque', focus: '50% 35%' } },
  { year: '3rd', frame: 'side', align: 'right', media: { kind: 'photo', name: 'aix-cheque', label: 'Receiving the AI+X prize' } },
  { year: 'jan 26', frame: 'scatter', lead: 'A semester in France.', copy: 'An exchange semester in Rennes: new friends, mentors who taught differently, and straight A’s.', meta: 'exchange student · rennes, france · jan to jun 2026', copyWidth: 276, media: { kind: 'photo', name: 'rennes-friends', label: 'Friends from the exchange semester in Rennes' }, scatter: [
    { name: 'rennes-campus', label: 'The campus in Rennes' },
    { name: 'rennes-trip', label: 'A trip during the exchange' },
  ] },
]

/** From LinkedIn's skills, and the tools behind the builds. */
export const SKILLS = {
  skills: ['Programming', 'Artificial Intelligence', 'Data Science', 'Data Analysis', 'Linear Regression', 'Linear Algebra', 'Research', 'Corporate Finance'],
  tools: ['Python', 'Django', 'JavaScript', 'TypeScript', 'React', 'Astro', 'C++', 'C#', 'Unity', 'Kotlin', 'PostgreSQL', 'Git & Docker'],
}

/* ---------- The gallery page ---------- */

export type GalleryCard = {
  id: string
  title: string
  who: string
  dates: string
  feature?: boolean
  photos: { name: string; caption: string }[]
}

export const GALLERY: GalleryCard[] = [
  {
    id: 'france',
    title: 'mr. olivier gauvin',
    who: 'His Excellency the Ambassador of France to Kuwait',
    dates: 'jun 2026 · sep 2026 · nov 2026',
    feature: true,
    photos: [
      { name: 'french-festival', caption: 'At the francophonie festival, nov 2026' },
      { name: 'french-sep', caption: 'With the French ambassador, sep 2026' },
      { name: 'french-embassy', caption: 'At the French embassy, jun 2026' },
      { name: 'francophonie-podium', caption: 'Closing of the francophonie month, nov 2026' },
      { name: 'french-embassy-portrait', caption: 'Inside the embassy, jun 2026' },
      { name: 'francophonie-venue', caption: 'The festival venue, nov 2026' },
      { name: 'french-embassy-plaque', caption: 'Ambassade de France, jun 2026' },
    ],
  },
  {
    id: 'swiss',
    title: 'Mr. tiziano balmelli',
    who: 'His Excellency the Ambassador of Switzerland to Kuwait',
    dates: 'nov 2026',
    photos: [{ name: 'swiss', caption: 'At the francophonie festival, nov 2026' }],
  },
  {
    id: 'chamoun',
    title: 'Mr. marc chamoun',
    who: 'Vice President of Executive Programs, Gartner UAE',
    dates: 'nov 2026',
    photos: [
      { name: 'chamoun-1', caption: 'On AI agents and where they create real value, nov 2026' },
      { name: 'chamoun-2', caption: 'Talking through Gartner’s guidelines, nov 2026' },
    ],
  },
  {
    id: 'mexico',
    title: 'Mr. eduardo huller',
    who: 'His Excellency the Ambassador of Mexico to Kuwait',
    dates: 'nov 2026',
    photos: [{ name: 'mexican', caption: 'At the francophonie festival, nov 2026' }],
  },
  {
    id: 'lebanon',
    title: 'Mr. ghady alkhoury',
    who: 'His Excellency the Ambassador of Lebanon to Kuwait',
    dates: 'nov 2026',
    photos: [{ name: 'lebanese', caption: 'At the francophonie festival, nov 2026' }],
  },
]

/** The four moments the lap passes in the season block. */
export const SEASON_MOMENTS = [
  { label: 'dec · ai+x, third place' },
  { label: 'jan · rennes exchange' },
  { label: 'may · bloomberg finance' },
  { label: 'nov · pix studio' },
]
