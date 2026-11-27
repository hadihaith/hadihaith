import { Suspense, lazy, useEffect } from 'react'
import Hero from '../sections/Hero'
import { Deferred, Stack } from '../components/Stack'
import { landed } from '../router'

const Season = lazy(() => import('../sections/Season'))
const Lower = lazy(() => import('../sections/Lower'))

/** Home is the projects page: the hero, the season (certificates), the workshop and the footer. */
export default function Home() {
  useEffect(() => {
    landed()
  }, [])
  return (
    <>
      <Stack>
        <Hero />
        <Deferred placeholder="placeholder-dark">
          <Suspense fallback={<div className="placeholder-dark" aria-hidden="true" />}>
            <Season />
          </Suspense>
        </Deferred>
      </Stack>
      <Deferred placeholder="placeholder-light">
        <Suspense fallback={<div className="placeholder-light" aria-hidden="true" />}>
          <Lower />
        </Suspense>
      </Deferred>
    </>
  )
}
