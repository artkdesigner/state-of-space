import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import residenceCircleSide from '../assets/residence-circle-side.svg'
import residenceCircleCenter from '../assets/residence-circle-center.svg'

const TOP_CARDS = [
  {
    title: 'Private Water Residence',
    text: 'A self-contained world on the ocean, free from land and external rhythms. Life unfolds here on its own terms.',
  },
  {
    title: 'Space Without Interruption',
    text: 'Open horizon in every direction. No visual barriers — only the shifting dialogue between interior, water, and sky.',
  },
  {
    title: 'Life Without Schedules',
    text: 'Life follows the sea: light, movement, conditions. Not routines, but shifts between action, rest, and awareness.',
  },
]

const BOTTOM_CARDS = [
  {
    title: 'Integrated Living System',
    text: 'The Water Residence integrates private suites, open decks, and shared living spaces into one seamless system. Every element minimizes friction and visual noise, enabling uninterrupted use day and night.',
  },
  {
    title: 'Autonomy',
    text: 'Here, the environment adapts to the occupant — not the other way around. The result is a living experience defined by autonomy, continuity, and a direct relationship with water and horizon.',
  },
]

export default function ResidenceSection() {
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const pin = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth)

    const trigger = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => '+=' + getDistance(),
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -getDistance() * self.progress })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section id="residence" className="Residence bg-blue">
      <div className="Residence-top relative w-full">
        <div
          ref={pinRef}
          className="Residence-top-pin relative flex h-dvh flex-col overflow-hidden"
        >
          <div className="Residence-top-horizontal relative flex w-full flex-1 items-center">
            <h2
              ref={trackRef}
              className="Residence-top-title whitespace-nowrap pl-5 font-manrope text-[3.125rem] font-light leading-none tracking-[-0.125rem] text-light/60 md:text-[6.25rem] md:tracking-[-0.25rem] lg:pl-5 lg:text-[15.625rem] lg:tracking-[-0.625rem]"
            >
              The Water Residence where time slows
            </h2>

            <div
              aria-hidden
              className="Residence-top-circles pointer-events-none absolute inset-0"
            >
              <img
                src={residenceCircleSide}
                alt=""
                className="absolute left-2.5 top-1/2 size-36 -translate-y-1/2 md:size-71 lg:left-0 lg:size-[44.2805rem]"
              />
              <img
                src={residenceCircleCenter}
                alt=""
                className="absolute left-1/2 top-1/2 h-36.75 w-40 -translate-x-1/2 -translate-y-1/2 md:h-72.75 md:w-79 lg:left-[33.1291rem] lg:h-[50.2868rem] lg:w-[54.6808rem] lg:translate-x-0"
              />
              <img
                src={residenceCircleSide}
                alt=""
                className="absolute right-2.5 top-1/2 size-36 -translate-y-1/2 md:size-71 lg:right-0 lg:size-[44.2805rem]"
              />
            </div>
          </div>

          <div className="Residence-top-footer flex w-full flex-col gap-4 pl-35 pr-2.5 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-10 md:px-2.5 lg:flex lg:flex-row lg:gap-5 lg:px-5 lg:pt-5 lg:pb-10">
            {TOP_CARDS.map((card) => (
              <div
                key={card.title}
                className="Residence-top-card flex flex-col gap-2.5 font-manrope text-[0.875rem] font-medium tracking-[-0.00875rem] lg:flex-1 lg:text-[1.125rem] lg:tracking-[-0.01125rem]"
              >
                <p className="text-light/60 leading-[1.3]">{card.title}</p>
                <p className="text-light leading-[1.3] lg:max-w-125">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="Residence-bottom flex flex-col items-center gap-35 px-2.5 py-5 md:gap-20 md:py-15 lg:gap-10 lg:px-5 lg:py-30">
        <div className="Residence-bottom-header flex w-full flex-col gap-35 pt-35 text-light md:gap-5 md:pt-0 lg:flex-row lg:items-start lg:justify-between">
          <p className="Residence-bottom-header-sub w-55.5 font-manrope text-[0.75rem] font-semibold leading-none tracking-[-0.0075rem] md:w-60 md:text-[0.875rem] md:tracking-[-0.00875rem] lg:w-150 lg:text-[0.875rem] lg:tracking-[-0.00875rem] lg:leading-[1.1]">
            A private water residence built as a continuous, autonomous living
            system on the ocean
          </p>
          <p className="Residence-bottom-header-title pl-30 font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.0375rem] md:pl-0 md:text-[1.875rem] md:tracking-[-0.05625rem] lg:w-[79.375rem] lg:text-[3.75rem] lg:tracking-[-0.1125rem]">
            A residence shaped by water, horizon, and uninterrupted space.
            Designed for autonomous living, where movement replaces schedules
            and time unfolds naturally.
          </p>
        </div>

        <div className="Residence-bottom-footer flex w-full items-center pl-30 md:pl-0 lg:pl-[59.9375rem]">
          <div className="Residence-bottom-column flex flex-1 flex-col gap-5 font-manrope text-[0.875rem] font-medium tracking-[-0.00875rem] md:grid md:grid-cols-2 md:gap-10 lg:flex lg:w-100 lg:flex-none lg:flex-col lg:text-[1.125rem] lg:tracking-[-0.01125rem]">
            {BOTTOM_CARDS.map((card) => (
              <div
                key={card.title}
                className="Residence-bottom-card flex flex-col gap-2.5"
              >
                <p className="text-light/60 leading-[1.3]">{card.title}</p>
                <p className="text-light leading-[1.3]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
