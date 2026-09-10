import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/**
 * Единственный на страницу Lenis-инстанс + мост с ScrollTrigger (иначе
 * позиции у пиновых секций рассинхронятся с плавным скроллом).
 * duration не задаётся — ломает lerp для колеса, см. figma-to-code skill.
 */
export function initSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function getLenis() {
  return lenis
}

let scrollLockCount = 0

/**
 * Счётчик блокировок скролла — нужен там, где один модал (BookingPopup)
 * может открыться поверх другого уже открытого (NavMenu), не закрывая его.
 * Снимать блокировку можно только когда закрылись оба, иначе закрытие
 * верхнего модала преждевременно возвращает скролл при ещё открытом нижнем.
 */
export function lockScroll() {
  scrollLockCount++
  if (scrollLockCount === 1) {
    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()
  }
}

export function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.documentElement.style.overflow = ''
    getLenis()?.start()
  }
}

/**
 * Плавный скролл к абсолютной пиксельной позиции документа — тот же
 * Lenis/easing, что и у scrollToHash (см. ниже), просто числом, а не
 * селектором. Нужен для целей ВНУТРИ горизонтально-скроллящихся пин-секций
 * (см. scrollToLocation2Panel в Location2Section.tsx) — там простой
 * `<a href="#id">`/scrollIntoView к элементу не работает: элемент лежит в
 * `position: sticky`-пине и его "истинная" вертикальная позиция зависит от
 * того, сколько ещё горизонтального прогресса трека нужно докрутить, а не
 * от статичного doc-offset, который вернул бы getBoundingClientRect.
 */
export function scrollToY(y: number) {
  const instance = getLenis()
  if (instance) {
    instance.scrollTo(y, {
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })
    return
  }
  window.scrollTo({ top: y, behavior: 'smooth' })
}

/**
 * Плавный скролл к якорю (клик по лого и т.п.) — обычный `<a href="#id">`
 * прыгает мгновенно, в обход Lenis. Если Lenis не инициализирован
 * (prefers-reduced-motion) — нативный scrollIntoView с behavior: smooth.
 *
 * `#hero` — особый случай, целимся числом 0, а не в сам DOM-элемент.
 * Hero — `position: sticky; top: 0` (см. HeroSection.tsx), и стоит
 * проскроллить мимо него (а лого кликают именно оттуда), её
 * `getBoundingClientRect()` перестаёт отражать "настоящую" позицию в
 * начале документа — sticky-элемент, отклеившись, замирает в позиции
 * "низ своего контейнера", и именно туда (а не к 0, к началу его пина)
 * целился бы Lenis, отдай мы ему сам селектор (баг, на который
 * пожаловался пользователь: лого кидало не в начало Hero, а куда-то в
 * середину её собственной scroll-анимации). Since Hero — первая секция
 * страницы, "к началу Hero" однозначно значит "наверх документа".
 */
export function scrollToHash(hash: string) {
  if (hash === '#hero') {
    scrollToY(0)
    return
  }
  const instance = getLenis()
  if (instance) {
    instance.scrollTo(hash, {
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })
    return
  }
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
}
