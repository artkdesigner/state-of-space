import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import baseImg from '../assets/location1-slider-base.webp'
import slide1 from '../assets/location1-slide-1.webp'
import slide2 from '../assets/location1-slide-2.webp'
import slide3 from '../assets/location1-slide-3.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Cliff Villa terrace and infinity pool at sunset, framed by the concrete and timber roofline',
  },
  {
    src: slide2,
    alt: 'The Cliff Villa seen against the mountain, with the pool reflecting the sunset sky',
  },
  {
    src: slide3,
    alt: 'The Cliff Villa perched above the ocean, mountain cliffs rising behind it',
  },
]

const SLIDE_COUNT = 3
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

type Location1SectionProps = {
  onBookNow: () => void
}

export default function Location1Section({ onBookNow }: Location1SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  /* Слайдер-кроссфейд Location1 (см. ниже) заодно подтягивает Cliff
   * вверх на -100vh (margin-top 0 → -100vh, полностью скрыто под
   * непрозрачным запиненным Location1 — не видно до самого перехода).
   * Без этого Cliff-пин (CliffSection.tsx, переход Location1 → Cliff)
   * включался бы только на СВОЁМ natural 'top top', а Location1 к тому
   * моменту уже почти целиком уезжает обычным скроллом (он ровно 1 экран
   * высотой) — тот же приём, что подтягивает Intro во время Hero и
   * Location1 во время Intro (см. HeroSection.tsx, IntroSection.tsx). */
  useEffect(() => {
    const section = sectionRef.current
    const cliff = document.getElementById('cliff')
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * SLIDE_COUNT,
      pin: true,
      scrub: true,
      onLeave: () => ScrollTrigger.refresh(),
      onUpdate: (self) => {
        const progress = self.progress

        // Верхний слайд i плавно гаснет вокруг границы (i+1)/SLIDE_COUNT,
        // открывая слайд i+1, лежащий под ним в стеке.
        for (let i = 0; i < SLIDE_COUNT - 1; i++) {
          const boundary = (i + 1) / SLIDE_COUNT
          const from = boundary - CROSSFADE / 2
          const to = boundary + CROSSFADE / 2
          const local = gsap.utils.clamp(0, 1, (progress - from) / (to - from))
          const el = slideEls.current[i]
          if (el) el.style.opacity = String(1 - smoothstep(local))
        }

        const index = Math.min(
          SLIDE_COUNT - 1,
          Math.floor(progress * SLIDE_COUNT),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))

        if (cliff) cliff.style.marginTop = `${-easeOutCubic(progress) * 100}vh`
      },
    })

    return () => {
      trigger.kill()
      if (cliff) cliff.style.marginTop = ''
    }
  }, [])

  return (
    <section
      id="location1"
      ref={sectionRef}
      className="Location1 relative isolate flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <LocationCard
        activeIndex={activeIndex}
        onBookNow={onBookNow}
        quote="Height clears perception, form gathers focus, and silence restores clarity."
        locationLabel="Location 1"
        nameLines={['The', 'Cliff Villa']}
      />
      <LocationSlider
        baseSrc={baseImg}
        slides={SLIDES}
        setSlideRef={setSlideRef}
      />
    </section>
  )
}
