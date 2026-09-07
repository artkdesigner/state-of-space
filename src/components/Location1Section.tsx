import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import { LOCATION1_PIN_VH, introPinEnd } from '../lib/scrollChain'
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

/** Число слайдов — совпадает с LOCATION1_PIN_VH (см. scrollChain.ts):
 * ровно 1 экран высоты скролла на слайд. */
const SLIDE_COUNT = LOCATION1_PIN_VH
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28
/** Доля прогресса, за которую Location-карточка успевает проявиться из
 * прозрачности после того, как секция встала на место. */
const CARD_FADE_IN = 0.2

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

type Location1SectionProps = {
  onBookNow: () => void
}

export default function Location1Section({ onBookNow }: Location1SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
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
   * Location1 во время Intro (см. HeroSection.tsx, IntroSection.tsx).
   * Location-карточка (LocationCard) проявляется из opacity: 0 в первые
   * CARD_FADE_IN прогресса — именно этого пина, который стартует ровно
   * когда секция встала на своё место, а не раньше во время наезда снизу.
   *
   * `start` — точная позиция скролла (конец пина Intro, см.
   * src/lib/scrollChain.ts), а не 'top top': при 'top top' и быстром
   * скролле (флик) секция телепортируется на нужную позицию вместо
   * плавного пина — см. подробный комментарий в IntroSection.tsx. */
  useEffect(() => {
    const section = sectionRef.current
    const cliff = document.getElementById('cliff')
    const card = cardRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: introPinEnd,
      end: () => introPinEnd() + window.innerHeight * SLIDE_COUNT,
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
        // Линейно, без ease — так проявление ощущается напрямую
        // привязанным к скроллу, а не рывком в начале и подвисанием в
        // конце (задняя часть карточки — backdrop-blur, на нём это
        // особенно заметно).
        if (card) {
          card.style.opacity = String(
            gsap.utils.clamp(0, 1, progress / CARD_FADE_IN),
          )
        }
      },
    })

    return () => {
      trigger.kill()
      if (cliff) cliff.style.marginTop = ''
      if (card) card.style.opacity = ''
    }
  }, [])

  return (
    <section
      id="location1"
      ref={sectionRef}
      className="Location1 relative isolate flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <LocationCard
        ref={cardRef}
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
