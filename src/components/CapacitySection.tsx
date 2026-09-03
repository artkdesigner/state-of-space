import capacityCirclesMobile from '../assets/capacity-circles-mobile.svg'
import capacityCirclesTablet from '../assets/capacity-circles-tablet.svg'
import capacityCirclesDesktop from '../assets/capacity-circles-desktop.svg'

export default function CapacitySection() {
  return (
    <section
      id="capacity"
      className="Capacity relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-light px-2.5"
    >
      <p className="Capacity-title relative z-1 w-75 text-center font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.15em] text-dark md:w-full md:text-[1.875rem] md:tracking-[-0.1em] lg:w-150 lg:text-[1.75rem] lg:font-medium lg:tracking-[-0.0714em]">
        What remains is not a feeling, but a capacity.
        <br className="hidden md:block" />
        The capacity to focus without tension, to think without overload, and to
        act with clarity.
      </p>

      <img
        src={capacityCirclesMobile}
        alt=""
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 h-[32.4969rem] w-[35.3144rem] -translate-x-1/2 -translate-y-1/2 md:hidden"
      />
      <img
        src={capacityCirclesTablet}
        alt=""
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 hidden h-[56.25rem] w-[61.1271rem] -translate-x-1/2 -translate-y-1/2 md:block lg:hidden"
      />
      <img
        src={capacityCirclesDesktop}
        alt=""
        className="Capacity-circles-wrap pointer-events-none absolute left-1/2 top-1/2 hidden h-[130.6125rem] w-[141.9371rem] -translate-x-1/2 -translate-y-1/2 lg:block"
      />
    </section>
  )
}
