import cliff1 from '../assets/cliff-1.webp'
import cliff2 from '../assets/cliff-2.webp'
import cliff3 from '../assets/cliff-3.webp'
import cliff4 from '../assets/cliff-4.webp'
import cliff5 from '../assets/cliff-5.webp'

const IMAGE_RADIUS =
  'overflow-hidden rounded-[0.5625rem] md:rounded-[0.9375rem] lg:rounded-[1.875rem]'

export default function CliffSection() {
  return (
    <section
      id="cliff"
      className="Cliff relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-light px-2.5 py-30 lg:px-5"
    >
      <h2 className="Cliff-title pointer-events-none absolute inset-0 z-1 flex items-center justify-center whitespace-nowrap font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
        The Cliff Villa
      </h2>

      <div className="Cliff-content-wrap relative z-2 flex w-full flex-col items-center lg:flex-row lg:items-center lg:justify-center lg:gap-5">
        <p className="Cliff-sub-title w-full -translate-y-46 text-center font-manrope text-[1.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-dark md:w-72.5 lg:w-[38.75rem] lg:translate-y-0 lg:-translate-x-165 lg:text-left lg:text-[2.875rem]">
          Not an Escape,
          <br />
          but a Return <br className="hidden lg:block" />
          to Clear Attention
        </p>

        <div className="Cliff-img-wrap relative mt-[23rem] mb-[26rem] h-35.5 w-42.5 shrink-0 md:mt-[26rem] md:mb-[32rem] md:h-50 md:w-60 lg:m-0 lg:h-125 lg:w-150">
          <div
            className={`Cliff-img-1 absolute -translate-y-1/2 left-[-8.0625rem] top-[calc(50%-21.78125rem)] h-[7.1875rem] w-[11.375rem] md:left-[-17.625rem] md:top-[calc(50%-24.75rem)] md:h-[11.875rem] md:w-[18.75rem] lg:left-[-45.1875rem] lg:top-[calc(50%-20.625rem)] lg:h-[23.75rem] lg:w-[37.5rem] ${IMAGE_RADIUS}`}
          >
            <img
              src={cliff1}
              alt="Living room silhouette at sunset with ocean view"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            className={`Cliff-img-2 absolute -translate-y-1/2 right-[-6.1875rem] top-[calc(50%-16.3125rem)] h-[9.375rem] w-[7.5rem] md:right-auto md:-translate-x-1/2 md:left-[calc(50%+18.9375rem)] md:top-[calc(50%-17.9375rem)] md:h-[15.625rem] md:w-[12.5rem] lg:left-[calc(50%+37.5rem)] lg:-translate-x-1/2 lg:top-[calc(50%-30.625rem)] lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
          >
            <img
              src={cliff2}
              alt="Living room window framing ocean waves and cliffs"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            className={`Cliff-img-3 absolute -translate-y-1/2 left-[-8.3125rem] top-[calc(50%+4.6875rem)] h-[8.25rem] w-[6.375rem] md:left-[-20.1875rem] md:top-[calc(50%+6.125rem)] md:h-[13.75rem] md:w-[10.625rem] lg:left-[-53.75rem] lg:top-[calc(50%+15rem)] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
          >
            <img
              src={cliff3}
              alt="Terrace daybed overlooking the cliffside at dusk"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            className={`Cliff-img-4 absolute -translate-y-1/2 left-[11.875rem] top-[calc(50%+10.78125rem)] h-[8.0625rem] w-[6.25rem] md:left-[23.3125rem] md:top-[calc(50%+14.1875rem)] md:h-[13.75rem] md:w-[10.625rem] lg:left-[56.25rem] lg:top-[calc(50%+18.75rem)] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
          >
            <img
              src={cliff4}
              alt="Ocean waves seen through the living room sliding doors"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            className={`Cliff-img-5 absolute -translate-x-1/2 -translate-y-1/2 left-[calc(50%-3rem)] top-[calc(50%+23.9375rem)] h-[9.375rem] w-[7.5rem] md:left-[calc(50%-3.875rem)] md:top-[calc(50%+28.3125rem)] md:h-[15.625rem] md:w-[12.5rem] lg:left-[calc(50%-8.75rem)] lg:top-[calc(50%+30.625rem)] lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
          >
            <img
              src={cliff5}
              alt="Aerial view of the villa and pool above the coastline at sunset"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="Cliff-description-wrap flex w-full -translate-y-56.5 md:-translate-y-62 lg:w-[38.75rem] lg:translate-y-0 lg:translate-x-165 lg:justify-end">
          <p className="Cliff-description w-full text-center font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] text-dark lg:w-[23.125rem] lg:text-left lg:text-[1.125rem]">
            This space is not about retreating from life, but about removing
            what distracts you from it. Here, attention becomes stable. Thoughts
            slow down.
          </p>
        </div>
      </div>
    </section>
  )
}
