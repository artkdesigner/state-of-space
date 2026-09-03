import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'

gsap.registerPlugin(ScrollTrigger)

const SLIDE_COUNT = 3
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)

export default function Location1Section() {
  const sectionRef = useRef<HTMLElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * SLIDE_COUNT,
      pin: true,
      scrub: true,
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
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id="location1"
      ref={sectionRef}
      className="Location1 relative isolate flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <LocationCard activeIndex={activeIndex} />
      <LocationSlider setSlideRef={setSlideRef} />
    </section>
  )
}
