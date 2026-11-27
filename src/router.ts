import { createContext, useContext } from 'react'
import { ROUTES, type Route } from './routes'

const BASE = import.meta.env.BASE_URL

/** Internal routes and home-page fragments also work without JavaScript. */
export const url = (href: string) => (href.startsWith('/') ? BASE + href.slice(1) : href.startsWith('#') ? BASE + href : href)

export function routeFromPath(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '').replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/'
  return (ROUTES as readonly string[]).includes(path) ? (path as Route) : '/'
}

export function currentRoute() {
  const path = '/' + location.pathname.slice(BASE.length).replace(/^\/+/, '')
  return routeFromPath(path)
}

export const RouteContext = createContext<Route>('/')
export const useRoute = () => useContext(RouteContext)
