import { useRef } from 'react'
import { useCursorImageTrail } from '../lib/cursorImageTrail'
import ctaIcon from '../assets/drift/cta-icon.svg'
import ctaIconMd from '../assets/drift/cta-icon-md.svg'
import ctaIconLg from '../assets/drift/cta-icon-lg.svg'
import cursor1 from '../assets/drift/cursor1.webp'
import cursor2 from '../assets/drift/cursor2.webp'
import cursor3 from '../assets/drift/cursor3.webp'

const CURSOR_IMAGES = [cursor1, cursor2, cursor3]

type DriftSectionProps = {
  onBookNow: () => void
}

export default function DriftSection({ onBookNow }: DriftSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const setCursorRef = useCursorImageTrail<HTMLDivElement>(
    sectionRef,
    CURSOR_IMAGES.length,
  )

  return (
    <section
      id="drift"
      ref={sectionRef}
      className="Drift relative isolate flex h-dvh w-full flex-col justify-between overflow-hidden bg-light p-2.5 lg:p-5"
    >
      <h2 className="Drift-title relative z-5 font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
        Drift, balance, presence — held by Water Residence.
      </h2>

      <div
        ref={setCursorRef(0)}
        className="Drift-cursor-img pointer-events-none absolute left-[4.25rem] top-[24.3125rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] opacity-100 transition-[opacity,scale] duration-700 ease-out md:left-[11.875rem] md:top-[28.375rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-0 lg:top-0 lg:opacity-0 lg:scale-75"
      >
        <img
          src={CURSOR_IMAGES[0]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div
        ref={setCursorRef(1)}
        className="Drift-cursor-img pointer-events-none absolute left-[8.625rem] top-[20.3125rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] opacity-100 transition-[opacity,scale] duration-700 ease-out md:left-[19.125rem] md:top-[24.375rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-0 lg:top-0 lg:opacity-0 lg:scale-75"
      >
        <img
          src={CURSOR_IMAGES[1]}
          alt=""
          className="absolute left-[-209.49%] top-[-0.16%] h-full w-[382.5%] max-w-none object-cover"
        />
      </div>

      <div
        ref={setCursorRef(2)}
        className="Drift-cursor-img pointer-events-none absolute left-[13.8125rem] top-[22.9375rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] opacity-100 transition-[opacity,scale] duration-700 ease-out md:left-[26.375rem] md:top-[27rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-0 lg:top-0 lg:opacity-0 lg:scale-75"
      >
        <img
          src={CURSOR_IMAGES[2]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <a
        href="#booking"
        onClick={(e) => {
          e.preventDefault()
          onBookNow()
        }}
        className="cta relative z-4 flex w-full items-start gap-2 md:items-end md:gap-2.5 lg:gap-5"
      >
        <div className="cta-icon-wrap flex h-8 w-21 flex-none shrink-0 items-center md:h-14 md:w-45 lg:h-auto lg:w-auto lg:flex-1">
          <img src={ctaIcon} alt="" aria-hidden className="size-8 md:hidden" />
          <img
            src={ctaIconMd}
            alt=""
            aria-hidden
            className="hidden md:block lg:hidden md:size-14"
          />
          <img
            src={ctaIconLg}
            alt=""
            aria-hidden
            className="hidden lg:block lg:size-35"
          />
        </div>
        <span className="cta-title w-[14.3593rem] font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:w-127 md:text-[3.375rem] md:tracking-[-0.135rem] lg:w-[79.375rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
          Request Access
        </span>
      </a>
    </section>
  )
}
