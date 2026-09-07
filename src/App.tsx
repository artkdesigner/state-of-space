import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import { reduceMotion } from './lib/anim'
import { HERO_INTRO_DURATION_MS } from './lib/heroIntro'
import { getLenis, initSmoothScroll } from './lib/scroll'

/* Пока не доиграла загрузочная интро-анимация Hero (навбар → Hero-img →
 * текст → subtitle, см. src/lib/heroIntro.ts), скролл заблокирован —
 * тот же приём (overflow: hidden + lenis.stop()), что и в BookingPopup/
 * NavMenu для модалок. При prefers-reduced-motion интро показывается
 * сразу целиком (см. useLayoutEffect в HeroSection/NavBar), блокировать
 * скролл незачем. */
function App() {
  useEffect(() => {
    const cleanupScroll = initSmoothScroll()

    if (reduceMotion()) {
      return cleanupScroll
    }

    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()

    const timeout = setTimeout(() => {
      document.documentElement.style.overflow = ''
      getLenis()?.start()
    }, HERO_INTRO_DURATION_MS)

    return () => {
      clearTimeout(timeout)
      document.documentElement.style.overflow = ''
      cleanupScroll()
    }
  }, [])

  return <HomePage />
}

export default App
