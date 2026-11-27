import { Suspense, lazy, useEffect } from 'react'
import { follow, useRoute } from './router'
import { PAGE_META, canonical } from './routes'

const Home = lazy(() => import('./pages/Home'))
const Journey = lazy(() => import('./pages/Journey'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Certificates = lazy(() => import('./pages/Certificates'))

const PAGES = { '/': Home, '/journey': Journey, '/certificates': Certificates, '/gallery': Gallery }

export default function App() {
  const route = useRoute()
  const Page = PAGES[route]
  const skipTarget = route === '/' ? '#season' : '#page-content'

  // The title, description and canonical URL follow the page, matching what the build wrote into its HTML.
  useEffect(() => {
    const meta = PAGE_META[route]
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical(route))
  }, [route])

  return (
    <>
      <a className="skip" href={skipTarget} onClick={route === '/' ? (e) => follow(skipTarget, e, { focus: true }) : undefined}>
        Skip to content
      </a>
      <main id="main" tabIndex={-1} key={route}>
        <Suspense fallback={<div className="placeholder-light" aria-hidden="true" />}>
          <Page />
        </Suspense>
      </main>
    </>
  )
}
