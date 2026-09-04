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
 */
export function scrollToHash(hash: string) {
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
