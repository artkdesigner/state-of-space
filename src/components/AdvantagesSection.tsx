import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import icon from '../assets/advantages/icon-active.svg'
import img1 from '../assets/advantages/1-reflection.webp'
import img2 from '../assets/advantages/2-flow.webp'
import img3 from '../assets/advantages/3-stillness.webp'
import img4 from '../assets/advantages/4-presence.webp'
import img5 from '../assets/advantages/5-continuity.webp'
import img6 from '../assets/advantages/6-balance.webp'
import img7 from '../assets/advantages/7-drift.webp'
import img8 from '../assets/advantages/8-rhythm.webp'
import img9 from '../assets/advantages/9-horizon.webp'
import img10 from '../assets/advantages/10-buoyancy.webp'
import img11 from '../assets/advantages/11-reflection2.webp'

const ITEMS = [
  { title: 'Reflection', image: img1 },
  { title: 'Flow', image: img2 },
  { title: 'Stillness', image: img3 },
  { title: 'Presence', image: img4 },
  { title: 'Continuity', image: img5 },
  { title: 'Balance', image: img6 },
  { title: 'Drift', image: img7 },
  { title: 'Rhythm', image: img8 },
  { title: 'Horizon', image: img9 },
  { title: 'Buoyancy', image: img10 },
  { title: 'Reflection', image: img11 },
]

export default function AdvantagesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * ITEMS.length,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(
          ITEMS.length - 1,
          Math.floor(self.progress * ITEMS.length),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id="advantages"
      ref={sectionRef}
      className="Advantages relative flex h-dvh w-full items-center justify-center overflow-hidden bg-light"
    >
      <div className="Advantages-pin flex h-full w-full flex-col gap-2.5 p-2.5 lg:grid lg:grid-cols-2 lg:gap-5 lg:p-5">
        <div className="Advantages-left relative flex-1 overflow-hidden rounded-[0.625rem] bg-gradient-to-b from-blue to-[#081e45] px-5 lg:rounded-[1.875rem] lg:px-15">
          <div
            aria-hidden
            className="Advantages-blur.top absolute inset-x-0 top-0 z-2 h-10 bg-gradient-to-t from-[rgba(8,30,69,0)] to-[#081e45] md:h-15 lg:h-35"
          />
          <div
            aria-hidden
            className="Advantages-blur.bottom absolute inset-x-0 bottom-0 z-2 h-10 bg-gradient-to-t from-[#081e45] to-[rgba(8,30,69,0)] backdrop-blur-[0.9375rem] md:h-15 lg:h-35"
          />

          <div
            className="Advantages-track absolute inset-x-0 top-1/2 flex flex-col gap-2.5 [--item-step:2.5rem] md:[--item-step:4rem] lg:[--item-step:9rem]"
            style={{
              transform: `translateY(calc(-1 * (${activeIndex} + 0.5) * var(--item-step)))`,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {ITEMS.map((item, i) => {
              const isCurrent = i === activeIndex
              return (
                <div
                  key={i}
                  className={`Advantages-item flex items-center gap-5 whitespace-nowrap font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] transition-colors duration-500 md:text-[3.375rem] md:tracking-[-0.135rem] lg:gap-10 lg:text-[8.375rem] lg:tracking-[-0.5025rem] ${
                    isCurrent ? 'text-light' : 'text-light/30'
                  }`}
                >
                  {isCurrent && (
                    <img
                      src={icon}
                      alt=""
                      aria-hidden
                      className="Advantages-item-icon h-6 w-7 shrink-0 md:h-10 md:w-11.5 lg:h-17.5 lg:w-20"
                    />
                  )}
                  <p className="leading-none">{item.title}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="Advantages-right relative flex-1 overflow-hidden rounded-[0.625rem] lg:rounded-[1.875rem]">
          {ITEMS.map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt=""
              loading={i === 0 ? undefined : 'lazy'}
              className={`Advantages-img absolute inset-0 size-full object-cover transition-opacity duration-700 ${
                i === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
