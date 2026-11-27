import { createRoot, hydrateRoot } from 'react-dom/client'
import App, { loadPage } from './App'
import { currentRoute, routeFromPath, url } from './router'
import './styles.css'
import './pages.css'

async function start() {
  // Keep links from the old hash router working.
  if (location.hash.startsWith('#/')) {
    location.replace(url(routeFromPath(location.hash.slice(1))))
    return
  }

  const route = currentRoute()
  const Page = await loadPage(route)
  const root = document.getElementById('root')!
  const app = <App route={route} Page={Page} />
  if (root.firstElementChild) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

void start()
