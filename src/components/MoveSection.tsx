import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import bgCircles from '../assets/move/bg-circles.svg'
import autonomy from '../assets/move/autonomy.webp'
import buoyancy from '../assets/move/buoyancy.webp'
import freedom from '../assets/move/freedom.webp'

const CARDS = [
  { label: 'Autonomy', image: autonomy, crop: true },
  { label: 'Buoyancy', image: buoyancy },
  { label: 'Freedom', image: freedom },
]

export default function MoveSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * CARDS.length,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(
          CARDS.length - 1,
          Math.floor(self.progress * CARDS.length),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id="move"
      ref={sectionRef}
      className="Move relative flex h-dvh w-full items-center justify-center overflow-hidden bg-light"
    >
      <img
        src={bgCircles}
        alt=""
        aria-hidden
        className="Move-bg-img pointer-events-none absolute left-1/2 top-1/2 w-[68.75rem] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[87.5rem] lg:w-[141.875rem]"
      />

      <div className="Move-pin relative z-1 flex h-full w-full flex-col items-center justify-center gap-15 px-2.5 lg:gap-25">
        <div className="Move-title-wrap flex w-full flex-col items-center gap-4 text-center lg:w-[117.5rem] lg:gap-10">
          <h2 className="Move-title font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
            Move with the Water
          </h2>
          <p className="Move-sub font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.00875rem] text-dark/60 md:w-[25.875rem] lg:w-[40.25rem] lg:text-[1.125rem] lg:tracking-[-0.01125rem]">
            Here, the destination is not the point — the movement itself is.
            Light glides across the surface, and with it, the perception of time
            begins to shift. The yacht becomes a vantage point over infinity.
            And within that widening horizon, a new sense of freedom emerges.
          </p>
        </div>

        <div className="Move-cards-wrap relative w-[12.5rem] overflow-hidden rounded-[0.5rem] [--card-step:13.6875rem] h-[13.6875rem] md:h-[19.125rem] md:w-[17.5rem] md:rounded-[0.75rem] md:[--card-step:19.125rem] lg:h-[28.75rem] lg:w-[26.25rem] lg:rounded-[1.875rem] lg:[--card-step:28.75rem]">
          <div
            className="Move-cards-track absolute inset-x-0 top-0 transition-transform duration-700 ease-out"
            style={{
              transform: `translateY(calc(-1 * ${activeIndex} * var(--card-step)))`,
            }}
          >
            {CARDS.map((card, i) => (
              <div
                key={card.label}
                className="Move-card absolute inset-x-0 flex h-[13.6875rem] flex-col justify-end overflow-hidden rounded-[0.5rem] bg-dark md:h-[19.125rem] md:rounded-[0.75rem] lg:h-[28.75rem] lg:rounded-[1.875rem]"
                style={{ top: `calc(${i} * var(--card-step))` }}
              >
                {card.crop ? (
                  <img
                    src={card.image}
                    alt=""
                    className="absolute left-[-50.04%] top-[0.04%] h-full w-[149.98%] max-w-none object-cover"
                  />
                ) : (
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
                <div className="Move-card-footer relative flex items-center p-3 md:p-4 lg:p-10">
                  <p className="font-manrope text-[1rem] leading-[1.1] font-medium tracking-[-0.02rem] text-light md:text-[1.125rem] md:tracking-[-0.0225rem] lg:text-[1.5rem] lg:leading-[0.9] lg:tracking-[-0.015rem]">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
