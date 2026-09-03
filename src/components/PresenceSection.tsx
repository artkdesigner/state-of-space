import presence1 from '../assets/presence-1.webp'
import presence2 from '../assets/presence-2.webp'
import presence3 from '../assets/presence-3.webp'
import presence4 from '../assets/presence-4.webp'
import presence5 from '../assets/presence-5.webp'
import presence6 from '../assets/presence-6.webp'
import presence7 from '../assets/presence-7.webp'
import Button from './Button'

type PresenceSectionProps = {
  onBookNow: () => void
}

const IMAGE_RADIUS =
  'overflow-hidden rounded-[0.375rem] md:rounded-[0.75rem] lg:rounded-[1.875rem]'

const SLOT_XL = 'w-24 shrink-0 md:w-48 lg:w-auto lg:shrink lg:grow lg:basis-0'
const SLOT_L = SLOT_XL
const SLOT_S = SLOT_XL

export default function PresenceSection({ onBookNow }: PresenceSectionProps) {
  return (
    <section
      id="presence"
      className="Presence relative flex h-dvh flex-col items-center justify-between overflow-hidden bg-light px-2.5 pt-60 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <div className="Presence-title-wrap flex w-full flex-col items-center justify-center gap-4 md:gap-5 lg:gap-10">
        <h2 className="Presence-title text-center font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
          Enter the Space of
          <br />
          Presence
        </h2>

        <div className="Presence-sub-wrap flex flex-col items-center gap-4 md:gap-5">
          <p className="Presence-sub w-[16.375rem] text-center font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] text-dark md:w-100">
            The Cliff Villa is a private, location-based experience shaped by
            architecture, landscape, and silence.
          </p>
          <Button onClick={onBookNow}>Request Access</Button>
        </div>
      </div>

      <div className="Presence-img-wrap flex w-full items-end justify-center gap-[0.3125rem] md:gap-2.5 lg:gap-5">
        <div
          className={`Presence-img-xl h-[7.625rem] md:h-61 lg:h-80 ${SLOT_XL} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence1}
            alt="Circular skylight above a minimalist dark-wood living room"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          className={`Presence-img-l h-[6.4375rem] md:h-[12.875rem] lg:h-[16.875rem] ${SLOT_L} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence2}
            alt="Woman relaxing in an infinity pool overlooking the ocean at sunset"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="Presence-img-m-slot flex w-24 shrink-0 items-center justify-center md:w-48 lg:shrink lg:grow lg:basis-0">
          <div className="-scale-y-100 w-full rotate-180">
            <div
              className={`Presence-img-m h-[4.8125rem] w-full md:h-[9.5625rem] lg:h-50 ${IMAGE_RADIUS}`}
            >
              <img
                src={presence3}
                alt="Living room sofa framing an ocean cliff view through sliding glass doors"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div
          className={`Presence-img-s h-[4.3125rem] md:h-[8.625rem] lg:h-45 ${SLOT_S} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence4}
            alt="Living room with a full glass wall overlooking the coastline"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          className={`Presence-img-m2 h-[4.8125rem] md:h-[9.5625rem] lg:h-50 ${SLOT_XL} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence5}
            alt="Curved-wall lounge with a round table overlooking the ocean"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          className={`Presence-img-l2 h-[6.4375rem] md:h-[12.875rem] lg:h-[16.875rem] ${SLOT_L} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence6}
            alt="Living room sofas lit by warm afternoon shadow patterns"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          className={`Presence-img-xl2 h-[7.625rem] md:h-61 lg:h-80 ${SLOT_XL} ${IMAGE_RADIUS}`}
        >
          <img
            src={presence7}
            alt="Concrete facade detail with a desert plant in front of a small window"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
