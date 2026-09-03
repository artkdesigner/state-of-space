import ctaIcon from '../assets/location2/cta-icon.svg'
import cursor1 from '../assets/location2/pillars-img-4.webp'
import cursor2 from '../assets/location2/balance-cursor-2.webp'
import cursor3 from '../assets/location2/balance-cursor-3.webp'
import cursor4 from '../assets/location2/pillars-img-5.webp'

type Location2BalanceProps = {
  onBookNow: () => void
}

export default function Location2Balance({ onBookNow }: Location2BalanceProps) {
  return (
    <div className="Location2-balance relative isolate flex min-h-[45rem] flex-col justify-between gap-15 p-2.5 md:h-dvh md:min-h-0 md:w-[47rem] md:shrink-0 md:justify-between md:gap-0 lg:w-[120rem] lg:p-5">
      <img
        src={cursor1}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-1 absolute top-[16.625rem] left-[1.875rem] z-3 size-[6rem] rounded-[0.9375rem] object-cover md:top-[23rem] md:left-[14.0625rem] md:size-[5.9579rem] lg:top-[26.625rem] lg:left-[55.625rem] lg:h-[11.25rem] lg:w-[8.75rem] lg:rounded-[1.875rem]"
      />
      <img
        src={cursor2}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-2 absolute top-[25.625rem] left-[13.625rem] z-2 h-[12.25rem] w-[8.9375rem] rounded-[0.9375rem] object-cover md:top-[32rem] md:left-[26.3125rem] md:h-[12.2469rem] md:w-[8.9369rem] lg:top-[30.625rem] lg:left-[49.625rem] lg:h-[11.25rem] lg:w-[8.75rem] lg:rounded-[1.875rem]"
      />
      <img
        src={cursor3}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-3 absolute top-[25.625rem] left-[calc(50%-0.8125rem)] z-1 h-[15rem] w-[11rem] rounded-[0.9375rem] object-cover md:top-[32.03rem] md:left-[calc(50%+0.03125rem)] md:h-[15rem] md:w-[10.9375rem] lg:top-[34.625rem] lg:left-[43.625rem] lg:h-[11.25rem] lg:w-[8.75rem] lg:rounded-[1.875rem]"
      />
      <img
        src={cursor4}
        alt=""
        loading="lazy"
        className="Balance-cursor-img-4 absolute top-[38.625rem] left-[37.625rem] z-0 hidden h-[11.25rem] w-[8.75rem] rounded-[1.875rem] object-cover lg:block"
      />

      <p className="relative z-5 font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
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
          src={ctaIcon}
          alt=""
          className="size-8 shrink-0 md:size-[3.5rem] lg:size-[8.75rem]"
        />
        <span className="font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
          Request Access
        </span>
      </a>
    </div>
  )
}
