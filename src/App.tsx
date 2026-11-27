import { Suspense, lazy, useEffect } from 'react'
import Home from './pages/Home'
import { useRoute } from './router'

// The other pages are their own chunks: the home page never pays for them.
const Journey = lazy(() => import('./pages/Journey'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Certificates = lazy(() => import('./pages/Certificates'))

const PAGES = { '/journey': Journey, '/certificates': Certificates, '/gallery': Gallery }

export default function App() {
  const route = useRoute()
  const Page = route === '/' ? null : PAGES[route]

  useEffect(() => {
    // Above 1920 the root keeps scaling: a rem stays one design pixel of the 1920 band.
    const onResize = () => {
      document.documentElement.style.fontSize = window.innerWidth > 1920 ? `${(16 * window.innerWidth) / 1920}px` : ''
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <a className="skip" href={route === '/' ? '#season' : '#page-content'}>
        Skip to content
      </a>
      <main id="main" tabIndex={-1} key={route}>
        {Page ? (
          <Suspense fallback={<div className="placeholder-light" aria-hidden="true" />}>
            <Page />
          </Suspense>
        ) : (
          <Home />
        )}
      </main>
    </>
  )
}
