import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import introLogo from '../assets/intro-logo.svg'
import { reduceMotion } from '../lib/anim'
import { INTRO_PIN_VH, heroPinEnd } from '../lib/scrollChain'

/** Собственный пин Intro, в высотах вьюпорта — см. «Скролл-переход Intro
 * → Location1» ниже. Общий источник с HeroSection.tsx/Location1Section.tsx
 * (см. src/lib/scrollChain.ts). Наезд самого Intro поверх Hero сюда не
 * входит — это последняя фаза пина Hero (см. HeroSection.tsx), у Intro
 * здесь только его собственные reveal + rise. */
const PIN_VH = INTRO_PIN_VH
/** Первая фаза пина: Intro-title/Intro-logo/Intro-bottom-wrap появляются
 * через slide-up + opacity. */
const REVEAL_PIN_VH = 1
/** Вторая фаза пина: Intro стоит на месте, Location1 наезжает поверх. */
const RISE_PIN_VH = 1
/** Доля общего прогресса пина (0..1), на которой заканчивается reveal и
 * начинается наезд Location1. */
const REVEAL_FRACTION = REVEAL_PIN_VH / (REVEAL_PIN_VH + RISE_PIN_VH)
/** Смещение по Y для слайд-ап эффекта, px — как у убранного отсюда
 * <Reveal distance={24}> (дефолт компонента, см. src/lib/anim.tsx). */
const REVEAL_DISTANCE = 24
/** Окна reveal-прогресса (0..1 внутри REVEAL_PIN_VH) для каждого элемента —
 * с нахлёстом, чтобы получился каскад, а не одновременное появление всех
 * трёх сразу. Порядок и нахлёст сохраняют прежнюю задумку (title, потом
 * logo, потом bottom-wrap — раньше это было пороками
 * IntersectionObserver 0.5 / 0.75 / 1 у <Reveal>). */
const TITLE_WINDOW: [number, number] = [0, 0.5]
const LOGO_WINDOW: [number, number] = [0.25, 0.75]
const BOTTOM_WRAP_WINDOW: [number, number] = [0.5, 1]

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const windowProgress = (p: number, [start, end]: [number, number]) =>
  clamp((p - start) / (end - start))

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const bottomWrapRef = useRef<HTMLDivElement>(null)

  /* Скролл-переход Intro → Location1 (см. покадровую сцену в Figma) —
   * двухфазный пин на REVEAL_PIN_VH + RISE_PIN_VH (наезд самого Intro
   * поверх Hero — это ещё более ранняя фаза, целиком внутри пина Hero,
   * см. комментарий у PIN_VH выше):
   * Фаза 1 (первые REVEAL_PIN_VH вьюпортов, REVEAL_FRACTION общего
   * прогресса): Intro-title, Intro-logo, Intro-bottom-wrap появляются
   * через slide-up + opacity — с нахлёстом по TITLE_WINDOW/LOGO_WINDOW/
   * BOTTOM_WRAP_WINDOW, линейно по скроллу (без easing — как и в Hero,
   * нелинейный easing вместе с отдельными окнами создаёт то же ощущение
   * «стоп-кадр → резкий скачок», которое уже чинили там). Location1 при
   * этом не двигается.
   * Фаза 2 (последние RISE_PIN_VH вьюпортов): Intro остаётся статичным,
   * Location1 наезжает снизу через margin-top (0 → -100vh) с закруглённым
   * верхним краем, который линейно распрямляется вместе с подъёмом (тот
   * же приём, что и рост/распрямление Hero-img в HeroSection — раньше
   * здесь тоже был easeOutCubic + отложенный порог RADIUS_START_FRACTION,
   * из-за которого распрямление сжималось в короткий рывок в конце).
   *
   * `start` — не 'top top', а точная позиция скролла (конец пина Hero,
   * см. src/lib/scrollChain.ts), а не натуральная позиция Intro. При
   * 'top top' GSAP кэширует стартовую позицию при монтировании (margin
   * секции-триггера ещё 0) и пересчитывает её через
   * ScrollTrigger.refresh() в onLeave предыдущего шага — но при быстром
   * скролле (флик) этот refresh иногда не успевает сработать до того, как
   * скролл уже проехал границу, и секция «телепортируется» вместо
   * плавного пина. Абсолютная позиция не зависит от кэша вообще. */
  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const logo = logoRef.current
    const bottomWrap = bottomWrapRef.current
    const location1 = document.getElementById('location1')
    if (!section || !title || !logo || !bottomWrap || !location1) return

    if (reduceMotion()) {
      title.style.opacity = '1'
      title.style.transform = 'none'
      logo.style.opacity = '1'
      logo.style.transform = 'none'
      bottomWrap.style.opacity = '1'
      bottomWrap.style.transform = 'none'
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: heroPinEnd,
      end: () => heroPinEnd() + window.innerHeight * PIN_VH,
      pin: true,
      scrub: true,
      onLeave: () => ScrollTrigger.refresh(),
      onUpdate: (self) => {
        const revealProgress = clamp(self.progress / REVEAL_FRACTION)

        const titleT = windowProgress(revealProgress, TITLE_WINDOW)
        title.style.opacity = String(titleT)
        title.style.transform = `translateY(${(1 - titleT) * REVEAL_DISTANCE}px)`

        const logoT = windowProgress(revealProgress, LOGO_WINDOW)
        logo.style.opacity = String(logoT)
        logo.style.transform = `translateY(${(1 - logoT) * REVEAL_DISTANCE}px)`

        const bottomWrapT = windowProgress(revealProgress, BOTTOM_WRAP_WINDOW)
        bottomWrap.style.opacity = String(bottomWrapT)
        bottomWrap.style.transform = `translateY(${(1 - bottomWrapT) * REVEAL_DISTANCE}px)`

        const riseProgress = clamp(
          (self.progress - REVEAL_FRACTION) / (1 - REVEAL_FRACTION),
        )
        location1.style.zIndex = '46'
        location1.style.marginTop = `${-riseProgress * 100}vh`
        const radius = (1 - riseProgress) * 45
        location1.style.borderTopLeftRadius = `${radius}vw`
        location1.style.borderTopRightRadius = `${radius}vw`
      },
    })

    return () => {
      trigger.kill()
      title.style.opacity = ''
      title.style.transform = ''
      logo.style.opacity = ''
      logo.style.transform = ''
      bottomWrap.style.opacity = ''
      bottomWrap.style.transform = ''
      location1.style.zIndex = ''
      location1.style.marginTop = ''
      location1.style.borderTopLeftRadius = ''
      location1.style.borderTopRightRadius = ''
    }
  }, [])

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="Intro relative flex min-h-dvh flex-col items-center justify-between bg-brown px-2.5 py-15 text-light lg:px-5 lg:py-30"
    >
      <h2
        ref={titleRef}
        className="Intro-title mx-auto max-w-[94rem] text-center font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.03em] opacity-0 md:text-[1.875rem] lg:text-[3.75rem]"
      >
        Live a unique experience inspired by the natural rhythm of the ocean.
        An experience where the important thing is not a change of scenery,
        but the inner sensation.
      </h2>

      <img
        ref={logoRef}
        src={introLogo}
        alt="State of Space"
        className="Intro-logo size-25 opacity-0"
      />

      <div
        ref={bottomWrapRef}
        className="Intro-bottom-wrap grid w-full grid-cols-1 items-start gap-5 font-manrope text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] text-light/60 opacity-0 md:grid-cols-[10.75rem_1fr_10.75rem] lg:grid-cols-[1fr_37.75rem_1fr] lg:gap-0 lg:text-[1.125rem]"
      >
        <p className="Intro-bottom-title order-1 whitespace-nowrap text-center md:order-none md:text-left">
          Ocean Space
        </p>
        <p className="Intro-bottom-sub order-3 text-center md:order-none">
          Inspired by ocean landscapes and minimalist architecture, the
          project examines how spatial design influences focus, perception,
          and cognitive balance. Natural elements are used intentionally - to
          simplify, slow down, and clarify experience.
        </p>
        <p className="Intro-bottom-year order-2 whitespace-nowrap text-center md:order-none md:text-right">
          2026
        </p>
      </div>
    </section>
  )
}
