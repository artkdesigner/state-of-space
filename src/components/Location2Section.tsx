import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Location2Retreat from './Location2Retreat'
import Location2About from './Location2About'
import Location2History from './Location2History'
import Location2Pillars from './Location2Pillars'
import Location2Balance from './Location2Balance'

gsap.registerPlugin(ScrollTrigger)

const SLIDE_COUNT = 3
/** Доля прогресса ретрит-панели, за которую верхний слайд успевает уйти —
 * тот же приём, что в Location1Section. */
const CROSSFADE = 0.28

const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location2SectionProps = {
  onBookNow: () => void
}

export default function Location2Section({ onBookNow }: Location2SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const retreatRef = useRef<HTMLDivElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    /** Горизонтальный скролл-скраб активен только на tablet/desktop (md+) — на
     * mobile секция обычный вертикальный поток без пина. */
    mm.add('(min-width: 48rem)', () => {
      const getDistance = () => track.scrollWidth - window.innerWidth
      const getRetreatWidth = () => retreatRef.current?.offsetWidth ?? 0

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + getDistance(),
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const retreatWidth = getRetreatWidth()
            const distance = getDistance()
            if (!retreatWidth || !distance) return

            const local = gsap.utils.clamp(
              0,
              1,
              (self.progress * distance) / retreatWidth,
            )

            for (let i = 0; i < SLIDE_COUNT - 1; i++) {
              const boundary = (i + 1) / SLIDE_COUNT
              const from = boundary - CROSSFADE / 2
              const to = boundary + CROSSFADE / 2
              const t = gsap.utils.clamp(0, 1, (local - from) / (to - from))
              const el = slideEls.current[i]
              if (el) el.style.opacity = String(1 - smoothstep(t))
            }

            const index = Math.min(
              SLIDE_COUNT - 1,
              Math.floor(local * SLIDE_COUNT),
            )
            setActiveIndex((prev) => (prev === index ? prev : index))
          },
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      id="location2"
      ref={sectionRef}
      className="Location2 relative bg-light md:overflow-hidden"
    >
      <div
        ref={trackRef}
        className="Location2-track flex flex-col md:flex-row md:items-stretch"
      >
        <Location2Retreat
          ref={retreatRef}
          activeIndex={activeIndex}
          onBookNow={onBookNow}
          setSlideRef={setSlideRef}
        />
        <Location2About />
        <Location2History />
        <Location2Pillars />
        <Location2Balance onBookNow={onBookNow} />
      </div>
    </section>
  )
}
