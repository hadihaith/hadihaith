import { render } from 'preact-render-to-string'
import App, { loadPage } from './App'
import { routeFromPath } from './router'

export async function prerender({ url }: { url: string }) {
  const route = routeFromPath(url)
  const Page = await loadPage(route)
  return { html: render(<App route={route} Page={Page} />) }
}
