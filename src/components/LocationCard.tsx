import Button from './Button'

type LocationCardProps = {
  activeIndex: number
}

const STEP_COUNT = 3

export default function LocationCard({ activeIndex }: LocationCardProps) {
  return (
    <div className="Location relative z-2 flex w-89.5 flex-col items-center gap-20 md:w-110 md:gap-30 lg:w-auto lg:gap-40">
      <div className="Location-top flex min-h-95 w-75 max-w-75 min-w-75 flex-col items-center justify-center gap-10 overflow-hidden rounded-[7.5rem] bg-[rgba(33,31,30,0.3)] p-6 text-center backdrop-blur-[1.25rem] md:min-h-120 md:w-90 md:max-w-90 md:min-w-90 md:rounded-[8.75rem] md:px-7.5 md:py-15 lg:min-h-137.5 lg:w-110 lg:max-w-110 lg:min-w-110 lg:rounded-[11.25rem] lg:px-15 lg:py-30">
        <p className="Location-top-title w-full font-manrope text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.03em] text-light md:w-75 lg:w-75 lg:text-[2.625rem] lg:tracking-[-0.04em]">
          Height clears perception, form gathers focus, and silence restores
          clarity.
        </p>

        <div className="Location-stepper flex items-start gap-1 md:gap-2 lg:gap-2">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span
              key={i}
              className={`Location-step h-px w-9.25 shrink-0 transition-colors duration-500 ${
                i === activeIndex ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="Location-footer flex w-full min-w-90 flex-col items-start gap-2.5 rounded-[2.5rem] bg-[rgba(33,31,30,0.3)] p-6 backdrop-blur-[1.25rem] md:min-w-90 md:w-90 lg:min-w-110 lg:p-7.5">
        <p className="Location-footer-sub w-full font-manrope text-[0.75rem] leading-none tracking-[-0.01em] text-light/60 md:text-[0.875rem] md:leading-[1.1] lg:text-[0.875rem] lg:leading-[1.1]">
          Location 1
        </p>

        <div className="Location-content-wrap flex w-full items-end gap-5">
          <p className="Location-footer-title flex-1 font-manrope text-[1.5rem] leading-[0.9] font-semibold tracking-[-0.03em] text-light uppercase md:text-[1.75rem] lg:text-[2rem]">
            The
            <br />
            Cliff Villa
          </p>
          <Button variant="light">Book now</Button>
        </div>
      </div>
    </div>
  )
}
