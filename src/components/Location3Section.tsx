import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import baseImg from '../assets/location3-slider-base.webp'
import slide1 from '../assets/location3-slide-1.webp'
import slide2 from '../assets/location3-slide-2.webp'
import slide3 from '../assets/location3-slide-3.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Water Residence yacht deck at sunset, hills rising across the water',
  },
  {
    src: slide2,
    alt: 'The Water Residence yacht cruising along the coastline',
  },
  {
    src: slide3,
    alt: 'The Water Residence yacht deck seating overlooking the sea',
  },
]

const SLIDE_COUNT = 3
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location3SectionProps = {
  onBookNow: () => void
}

export default function Location3Section({ onBookNow }: Location3SectionProps) {
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
      id="location3"
      ref={sectionRef}
      className="Location3 relative isolate flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <LocationCard
        activeIndex={activeIndex}
        onBookNow={onBookNow}
        quote={
          'Where earth meets water, a profound sense of "I am here" naturally arises.'
        }
        locationLabel="Location 3"
        nameLines={['The Water Residence']}
      />
      <LocationSlider
        baseSrc={baseImg}
        slides={SLIDES}
        setSlideRef={setSlideRef}
      />
    </section>
  )
}
