// The site's pages. Shared by the router and by vite.config.ts, which writes a
// copy of index.html into each page's folder (with that page's title,
// description and canonical URL) so every path loads, and previews, on its own.
export const ROUTES = ['/', '/journey', '/certificates', '/gallery'] as const
export type Route = (typeof ROUTES)[number]

export const SITE_URL = 'https://hadihaidar.tech'

/** What search results and link previews show for each page. */
export const PAGE_META: Record<Route, { title: string; description: string }> = {
  '/': {
    title: 'Hadi Haidar · Full-stack engineer',
    description:
      'Hadi Haidar, full-stack engineer at Kuwait University. Projects from a NASA Space Apps game to an LED backpack app, certificates from Harvard and Stanford, and the journey so far.',
  },
  '/journey': {
    title: 'Journey · Hadi Haidar',
    description:
      'From Kuwait University to third place at the GCC AI+X summit and an exchange semester in France: the roles, milestones and skills along the way.',
  },
  '/certificates': {
    title: 'Certificates · Hadi Haidar',
    description:
      'Certificates from Harvard CS50, Stanford Code in Place, freeCodeCamp, Codecademy and Bloomberg. View each one, or verify it with the issuer.',
  },
  '/gallery': {
    title: 'Gallery · Hadi Haidar',
    description: 'Meetings with ambassadors and leaders in tech, and the conversations behind the photos.',
  },
}

/** A page's canonical address: no trailing slash, the home page as the bare domain. */
export const canonical = (route: Route) => SITE_URL + (route === '/' ? '/' : route)
