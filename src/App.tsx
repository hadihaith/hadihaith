import { RouteContext } from './router'
import type { Route } from './routes'

const pages = {
  '/': () => import('./pages/Home'),
  '/journey': () => import('./pages/Journey'),
  '/gallery': () => import('./pages/Gallery'),
  '/certificates': () => import('./pages/Certificates'),
}

export const loadPage = async (route: Route) => (await pages[route]()).default

export default function App({ route, Page }: { route: Route; Page: React.ComponentType }) {
  return (
    <RouteContext.Provider value={route}>
      <a className="skip" href={route === '/' ? '#season' : '#page-content'}>Skip to content</a>
      <main id="main" tabIndex={-1}>
        <Page />
      </main>
    </RouteContext.Provider>
  )
}
