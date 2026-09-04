import { useRef } from 'react'
import { useCursorImageTrail } from '../lib/cursorImageTrail'
import ctaIconMobile from '../assets/location2/cta-icon-mobile.svg'
import ctaIconTablet from '../assets/location2/cta-icon-tablet.svg'
import ctaIconDesktop from '../assets/location2/cta-icon.svg'
import cursor1 from '../assets/location2/pillars-img-4.webp'
import cursor2 from '../assets/location2/balance-cursor-2.webp'
import cursor3 from '../assets/location2/balance-cursor-3.webp'
import cursor4 from '../assets/location2/pillars-img-5.webp'

const CURSOR_IMAGES = [cursor1, cursor2, cursor3, cursor4]

type Location2BalanceProps = {
  onBookNow: () => void
}

export default function Location2Balance({ onBookNow }: Location2BalanceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setCursorRef = useCursorImageTrail<HTMLImageElement>(
    containerRef,
    CURSOR_IMAGES.length,
  )

  return (
    <div
      ref={containerRef}
      className="Location2-balance relative isolate flex min-h-[45rem] flex-col justify-between gap-15 p-2.5 md:h-dvh md:min-h-0 md:w-[47rem] md:shrink-0 md:justify-between md:gap-0 lg:w-[120rem] lg:p-5"
    >
      <img
        ref={setCursorRef(0)}
        src={cursor1}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-1 pointer-events-none absolute top-[16.625rem] left-[1.875rem] z-3 size-[6rem] rounded-[0.9375rem] object-cover opacity-100 transition-opacity duration-500 md:top-[23rem] md:left-[14.0625rem] md:size-[5.9579rem] lg:top-0 lg:left-0 lg:h-[11.25rem] lg:w-[8.75rem] lg:rounded-[1.875rem] lg:opacity-0"
      />
      <img
        ref={setCursorRef(1)}
        src={cursor2}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-2 pointer-events-none absolute top-[25.625rem] left-[13.625rem] z-2 h-[12.25rem] w-[8.9375rem] rounded-[0.9375rem] object-cover opacity-100 transition-opacity duration-500 md:top-[32rem] md:left-[26.3125rem] md:h-[12.2469rem] md:w-[8.9369rem] lg:top-0 lg:left-0 lg:h-[11.25rem] lg:w-[8.75rem] lg:rounded-[1.875rem] lg:opacity-0"
      />
      <img
        ref={setCursorRef(2)}
        src={cursor3}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-3 pointer-events-none absolute top-[25.625rem] left-[calc(50%-0.8125rem)] z-1 h-[15rem] w-[11rem] rounded-[0.9375rem] object-cover opacity-100 transition-opacity duration-500 md:top-1/2 md:left-[calc(50%+0.03125rem)] md:h-[15rem] md:w-[10.9375rem] md:-translate-x-1/2 md:-translate-y-1/2 lg:top-0 lg:left-0 lg:h-[11.25rem] lg:w-[8.75rem] lg:translate-x-0 lg:translate-y-0 lg:rounded-[1.875rem] lg:opacity-0"
      />
      <img
        ref={setCursorRef(3)}
        src={cursor4}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-4 pointer-events-none absolute top-0 left-0 z-0 hidden h-[11.25rem] w-[8.75rem] rounded-[1.875rem] object-cover opacity-0 transition-opacity duration-500 lg:block"
      />

      <p className="relative z-5 font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
        <span>A balanced island </span>
        <span className="text-dark/60 lg:text-dark/30">
          retreat between land and horizon
        </span>
      </p>

      <a
        href="#booking"
        onClick={(e) => {
          e.preventDefault()
          onBookNow()
        }}
        className="Balance-cta relative z-4 flex w-full items-center gap-2 md:gap-2.5 lg:gap-5"
      >
        <img
          src={ctaIconMobile}
          alt=""
          className="Cta-icon-wrap h-8 w-21 shrink-0 md:hidden"
        />
        <img
          src={ctaIconTablet}
          alt=""
          className="Cta-icon-wrap hidden h-14 w-45 shrink-0 md:block lg:hidden"
        />
        <div className="Cta-icon-wrap hidden items-center lg:flex lg:flex-1">
          <img src={ctaIconDesktop} alt="" className="size-35 shrink-0" />
        </div>
        <span className="font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
          Request Access
        </span>
      </a>
    </div>
  )
}
