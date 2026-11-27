// The site's pages. Shared by the router and by vite.config.ts, which writes a
// copy of index.html into each page's folder so every path loads on GitHub Pages.
export const ROUTES = ['/', '/journey', '/certificates', '/gallery'] as const
export type Route = (typeof ROUTES)[number]
