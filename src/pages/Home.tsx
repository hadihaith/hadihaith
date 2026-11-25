import { Suspense, lazy, useEffect } from 'react'
import Hero from '../sections/Hero'
import Season from '../sections/Season'
import { Deferred, Stack } from '../components/Stack'
import { landed } from '../router'

const Lower = lazy(() => import('../sections/Lower'))

/** Home is the projects page: the hero, the season (certificates), the workshop and the footer. */
export default function Home() {
  useEffect(() => {
    document.title = 'Hadi Haidar'
    landed()
  }, [])
  return (
    <>
      <Stack>
        <Hero />
        <Deferred placeholder="placeholder-dark">
          <Season />
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
