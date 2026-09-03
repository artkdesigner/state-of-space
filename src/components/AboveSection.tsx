import aboveBg from '../assets/above-bg.webp'
import aboveCircleMobile from '../assets/above-circle-mobile.svg'
import aboveCircleTablet from '../assets/above-circle-tablet.svg'
import aboveCircleDesktop from '../assets/above-circle-desktop.svg'

export default function AboveSection() {
  return (
    <section
      id="above"
      className="Above relative flex min-h-dvh items-center overflow-hidden"
    >
      <img
        src={aboveBg}
        alt="Aerial view of a woman in a white dress standing on a cliff above the ocean"
        className="absolute inset-0 size-full object-cover object-center lg:object-[50%_68%]"
        loading="lazy"
      />

      <div className="Above-pin relative z-1 flex w-full items-center justify-between px-2.5 lg:justify-center lg:gap-21.25 lg:px-5">
        <div className="Above-left flex shrink-0 items-center">
          <p className="[word-break:break-word] whitespace-nowrap font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-light md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
            Above
            <br />
            the ocean
          </p>
        </div>

        <div className="Above-circle-wrap absolute top-1/2 left-1/2 z-[-1] size-75 -translate-x-1/2 -translate-y-1/2 md:size-125 lg:static lg:z-auto lg:size-150 lg:translate-x-0 lg:translate-y-0">
          <img src={aboveCircleMobile} alt="" className="size-full md:hidden" />
          <img
            src={aboveCircleTablet}
            alt=""
            className="hidden size-full md:block lg:hidden"
          />
          <img
            src={aboveCircleDesktop}
            alt=""
            className="hidden size-full lg:block"
          />
        </div>

        <div className="Above-right flex shrink-0 items-center justify-end">
          <p className="[word-break:break-word] whitespace-nowrap text-right font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-light md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
            Above
            <br />
            the world
          </p>
        </div>
      </div>
    </section>
  )
}
