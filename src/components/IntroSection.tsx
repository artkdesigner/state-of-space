import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import introLogo from '../assets/intro-logo.svg'
import { Reveal, reduceMotion } from '../lib/anim'

/** Скролл-дистанция наезда Location1 на Intro, в высотах вьюпорта. */
const PIN_VH = 2
/** Доля прогресса, за которую контент Intro успевает потускнеть —
 * по сцене «Intro to Location1» это происходит намного раньше, чем
 * Location1 поднимается даже на треть экрана. */
const FADE_RATIO = 0.15
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  /* Скролл-переход Intro → Location1 (см. покадровую сцену в Figma):
   * Location1 наезжает снизу через margin-top (0 → -100vh) с закруглённым
   * верхним краем (border-radius), который распрямляется по мере подъёма
   * — тот же приём, что и рост Hero-img в HeroSection. Контент Intro
   * тускнеет (opacity+blur на самой секции, не на детях — чтобы не
   * конфликтовать с их собственным Reveal) в первые 15% прогресса.
   * ScrollTrigger.refresh() в onLeave — обязателен: у Location1Section
   * свой pin ('top top'), GSAP кэширует его стартовую позицию при
   * монтировании (margin ещё 0); без refresh он сработает на 100vh
   * позже фактического появления секции в кадре. */
  useEffect(() => {
    const section = sectionRef.current
    const location1 = document.getElementById('location1')
    if (!section || !location1) return
    if (reduceMotion()) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * PIN_VH,
      pin: true,
      scrub: true,
      onLeave: () => ScrollTrigger.refresh(),
      onUpdate: (self) => {
        const rise = easeOutCubic(self.progress)

        location1.style.zIndex = '46'
        location1.style.marginTop = `${-rise * 100}vh`
        const radius = (1 - rise) * 45
        location1.style.borderTopLeftRadius = `${radius}vw`
        location1.style.borderTopRightRadius = `${radius}vw`

        const fade = Math.min(1, self.progress / FADE_RATIO)
        section.style.opacity = String(1 - fade * 0.7)
        section.style.filter = `blur(${fade * 6}px)`
      },
    })

    return () => {
      trigger.kill()
      location1.style.zIndex = ''
      location1.style.marginTop = ''
      location1.style.borderTopLeftRadius = ''
      location1.style.borderTopRightRadius = ''
      section.style.opacity = ''
      section.style.filter = ''
    }
  }, [])

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="Intro relative flex min-h-dvh flex-col items-center justify-between bg-brown px-2.5 py-15 text-light lg:px-5 lg:py-30"
    >
      <Reveal effect="fade-up" trigger="in-view">
        <h2 className="Intro-title mx-auto max-w-[94rem] text-center font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.03em] md:text-[1.875rem] lg:text-[3.75rem]">
          Live a unique experience inspired by the natural rhythm of the ocean.
          An experience where the important thing is not a change of scenery,
          but the inner sensation.
        </h2>
      </Reveal>

      <Reveal effect="fade-up" trigger="in-view">
        <img
          src={introLogo}
          alt="State of Space"
          className="Intro-logo size-25"
        />
      </Reveal>

      <Reveal effect="fade-up" trigger="in-view" className="w-full">
        <div className="Intro-bottom-wrap grid w-full grid-cols-1 items-start gap-5 font-manrope text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] text-light/60 md:grid-cols-[10.75rem_1fr_10.75rem] lg:grid-cols-[1fr_37.75rem_1fr] lg:gap-0 lg:text-[1.125rem]">
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
      </Reveal>
    </section>
  )
}
