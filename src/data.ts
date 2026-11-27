// Content pulled from LinkedIn (experience, education, certifications)
// and public GitHub repos (projects). Edit here to update the site.
import * as px from './pixels'

export const LINKS = {
  github: 'https://github.com/hadihaith',
}

/** '/route' links are pages; plain '#anchor' links are sections of the home page. */
export const NAV = [
  { label: 'projects', href: '#workshop' },
  { label: 'season', href: '#season' },
  { label: 'journey', href: '/journey' },
  { label: 'certificates', href: '/certificates' },
  { label: 'gallery', href: '/gallery' },
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
    short: 'dlc website',
    title: 'DLC Website',
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
    links: [
      { label: 'visit the site', href: 'https://www.dlccba.app' },
      { label: 'source', href: 'https://github.com/hadihaith/DLCwebsite' },
    ],
    frames: [px.qr, px.qr2],
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
    links: [
      { label: 'visit the site', href: 'https://www.salmanaljazzaf.com' },
      { label: 'source', href: 'https://github.com/hadihaith/SalmanAljazzaf' },
    ],
    frames: [px.cap, px.cap2],
  },
  {
    id: 'ttt',
    short: 'tictactoe',
    title: 'TicTacToe',
    date: 'playable',
    report: 'The classic, first written in Python for Codecademy’s CS portfolio. This one runs right here on its card, so take a turn.',
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

/** Who issued a certificate. `logo` names a file in src/media/logos; `wide` marks a wordmark that needs a wider tile. */
export type Issuer = 'harvard' | 'stanford' | 'freecodecamp' | 'codecademy' | 'bloomberg'
export const ISSUERS: Record<Issuer, { name: string; logo: string; wide?: boolean }> = {
  harvard: { name: 'Harvard University', logo: 'harvard' },
  stanford: { name: 'Stanford University', logo: 'stanford' },
  freecodecamp: { name: 'freeCodeCamp', logo: 'freecodecamp' },
  codecademy: { name: 'Codecademy', logo: 'codecademy' },
  bloomberg: { name: 'Bloomberg', logo: 'bloomberg', wide: true },
}

/** `href` verifies it on the issuer's site; `image` is the copy in src/media/certs; `short` labels it on the season lap. */
export type Cert = { title: string; short: string; issuer: string; from: Issuer; date: string; href: string; image: string }

// Oldest first: the order they were earned.
export const CERTS: Cert[] = [
  { title: 'CS50P: Programming with Python', short: 'cs50p', issuer: 'Harvard CS50', from: 'harvard', date: 'apr 24', href: 'https://certificates.cs50.io/8a51a41e-0784-45f0-9ed0-1361df23a1ed.pdf?size=letter', image: 'cs50p' },
  { title: 'Responsive Web Design', short: 'responsive web design', issuer: 'freeCodeCamp', from: 'freecodecamp', date: 'may 24', href: 'https://freecodecamp.org/certification/hadihaith/responsive-web-design', image: 'responsive-web-design' },
  { title: 'CS106A: Programming Methodology', short: 'code in place', issuer: 'Stanford Code in Place', from: 'stanford', date: 'jun 24', href: 'https://codeinplace.stanford.edu/cip4/certificate/yk8404', image: 'stanford-cip' },
  { title: 'CS50x: Computer Science', short: 'cs50x', issuer: 'Harvard CS50', from: 'harvard', date: 'aug 24', href: 'https://cs50.harvard.edu/certificates/5b6b7d17-0ded-41e1-8756-a12066fbbdbb', image: 'cs50x' },
  { title: 'JS Algorithms & Data Structures', short: 'js algorithms', issuer: 'freeCodeCamp', from: 'freecodecamp', date: 'aug 24', href: 'https://freecodecamp.org/certification/hadihaith/javascript-algorithms-and-data-structures-v8', image: 'js-dsa' },
  { title: 'C++ Fundamentals', short: 'c++', issuer: 'Codecademy', from: 'codecademy', date: 'sep 24', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/b74a2390dfc4127fa5d43fe147425ad0', image: 'cpp' },
  { title: 'CS50W: Web Programming', short: 'cs50w', issuer: 'Harvard CS50', from: 'harvard', date: 'jan 25', href: 'https://cs50.harvard.edu/certificates/e8c4467b-a257-4f1b-a890-b43232a11489', image: 'cs50w' },
  { title: 'ML & Data Foundations for AI', short: 'ml & data for ai', issuer: 'Codecademy', from: 'codecademy', date: 'apr 25', href: 'https://www.codecademy.com/profiles/hadihaith/certificates/5701108f64cd4a02981c161085ccc50e', image: 'data-foundations-ai' },
  { title: 'Bloomberg Finance Fundamentals', short: 'bloomberg finance', issuer: 'Bloomberg', from: 'bloomberg', date: 'may 26', href: 'https://portal.bloombergforeducation.com/certificates/wfiELu3wSGLDPoy4Jwhfy3uU', image: 'bloomberg-finance' },
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

