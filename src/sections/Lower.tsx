import Workshop from './Workshop'
import Footer from './Footer'

/** Everything below the sticky stack: its own chunk, fetched once the first screen is up. */
export default function Lower() {
  return (
    <>
      <Workshop />
      <Footer />
    </>
  )
}
