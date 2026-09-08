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
 * скролл незачем.
 *
 * Та же логика (HeroSection/NavBar) всегда проигрывает интро с нуля, не
 * глядя на текущий скролл — рассчитана на обычный заход на сайт (scrollY
 * 0). Если страницу перезагрузили уже проскроллив больше 1 вьюпорта
 * внутри Hero (браузер восстановил позицию скролла, см. scroll
 * restoration), блокировать скролл ради интро, которую пользователь и не
 * увидит (Hero-img/текст уже вне экрана), незачем — так же пропускаем
 * блокировку, как и при reduceMotion(). */
function App() {
  useEffect(() => {
    const cleanupScroll = initSmoothScroll()

    if (reduceMotion() || window.scrollY > window.innerHeight) {
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
