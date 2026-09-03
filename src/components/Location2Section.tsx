import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Location2Retreat from './Location2Retreat'
import Location2About from './Location2About'
import Location2History from './Location2History'
import Location2Pillars from './Location2Pillars'
import Location2Balance from './Location2Balance'

gsap.registerPlugin(ScrollTrigger)

type Location2SectionProps = {
  onBookNow: () => void
}

const noopSlideRef = () => () => {}

export default function Location2Section({ onBookNow }: Location2SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    /** Горизонтальный скролл-скраб активен только на tablet/desktop (md+) — на
     * mobile секция обычный вертикальный поток без пина. */
    mm.add('(min-width: 48rem)', () => {
      const getDistance = () => track.scrollWidth - window.innerWidth

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
          activeIndex={0}
          onBookNow={onBookNow}
          setSlideRef={noopSlideRef}
        />
        <Location2About />
        <Location2History />
        <Location2Pillars />
        <Location2Balance onBookNow={onBookNow} />
      </div>
    </section>
  )
}
