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
  const target = hash === '#hero' ? 0 : hash
  const instance = getLenis()
  if (instance) {
    instance.scrollTo(target, {
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })
    return
  }
  if (target === 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
}
