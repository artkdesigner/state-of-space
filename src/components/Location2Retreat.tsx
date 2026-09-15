import { forwardRef, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import {
  scrollToLocation2RetreatSlide,
  setLocation2RetreatMobileImpl,
} from './Location2Section'
import { scrollToY } from '../lib/scroll'
import baseImg from '../assets/location2/retreat-slider-base.webp'
import slide1 from '../assets/location2/retreat-slide-1.webp'
import slide2 from '../assets/location2/retreat-slide-2.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Island Retreat seen through wind-shaped pine trees at golden hour',
  },
  {
    src: slide2,
    alt: 'The Island Retreat pavilion framed by pine branches at dusk',
  },
  {
    src: baseImg,
    alt: 'The Island Retreat surrounded by pine trees on the coastline',
  },
]

/** На mobile (<48rem) у Location2Section вообще нет пина/трека (см. её
 * комментарий у useEffect) — Retreat раньше стоял обычным h-dvh блоком в
 * потоке, а слайд-кроссфейду (SLIDES выше) нечем было идти: жалоба
 * пользователя "location2 slider не пиниться и не пролистывается". Тот же
 * баг и тот же фикс уже были у Location3 (см. её комментарий в
 * Location3Panel.tsx) — свой собственный, полностью самодостаточный pin +
 * ScrollTrigger кроссфейд на mobile, независимый от Location2Section (там
 * его на mobile просто не запускают, см. matchMedia-ветки там же). */
const SLIDE_COUNT = 3
const CROSSFADE = 0.28
const LAST_CROSSFADE_END = (SLIDE_COUNT - 1) / SLIDE_COUNT + CROSSFADE / 2
const ACTIVE_VH = SLIDE_COUNT * LAST_CROSSFADE_END

const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location2RetreatProps = {
  activeIndex: number
  onBookNow: () => void
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

const Location2Retreat = forwardRef<HTMLDivElement, Location2RetreatProps>(
  function Location2Retreat({ activeIndex, onBookNow, setSlideRef }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const localSlideEls = useRef<(HTMLDivElement | null)[]>([])
    const [mobileActiveIndex, setMobileActiveIndex] = useState(0)

    const setLocalSlideRef = (index: number) => (el: HTMLDivElement | null) => {
      localSlideEls.current[index] = el
      setSlideRef(index)(el)
    }

    useEffect(() => {
      const wrap = wrapRef.current
      if (!wrap) return

      const wrapTop = () => {
        const r = wrap.getBoundingClientRect()
        return r.top + window.scrollY
      }

      // Клик по Location-step на mobile (см. LocationCard.tsx) — та же
      // формула "середина виртуального ACTIVE_VH-широкого окна слайда",
      // что и mobile-импл у Location3Panel.tsx. Регистрируется как
      // mobile-реализация scrollToLocation2RetreatSlide (см.
      // setLocation2RetreatMobileImpl в Location2Section.tsx).
      setLocation2RetreatMobileImpl((index: number) => {
        const target = gsap.utils.clamp(
          0,
          window.innerHeight * ACTIVE_VH,
          (index + 0.5) * window.innerHeight,
        )
        scrollToY(wrapTop() + target)
      })

      const mm = gsap.matchMedia()

      mm.add('(max-width: 47.9375rem)', () => {
        const trigger = ScrollTrigger.create({
          trigger: wrap,
          start: wrapTop,
          end: () => wrapTop() + window.innerHeight * ACTIVE_VH,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress * LAST_CROSSFADE_END

            for (let i = 0; i < SLIDE_COUNT - 1; i++) {
              const boundary = (i + 1) / SLIDE_COUNT
              const from = boundary - CROSSFADE / 2
              const to = boundary + CROSSFADE / 2
              const local = gsap.utils.clamp(0, 1, (progress - from) / (to - from))
              const el = localSlideEls.current[i]
              if (el) el.style.opacity = String(1 - smoothstep(local))
            }

            const index = Math.min(
              SLIDE_COUNT - 1,
              Math.floor(progress * SLIDE_COUNT),
            )
            setMobileActiveIndex((prev) => (prev === index ? prev : index))
          },
        })

        return () => {
          trigger.kill()
          localSlideEls.current.forEach((el) => {
            if (el) el.style.opacity = ''
          })
        }
      })

      return () => {
        mm.revert()
        setLocation2RetreatMobileImpl(null)
      }
    }, [])

    return (
      <div
        ref={wrapRef}
        className="Location2-retreat-pin-wrap relative md:contents"
        style={{ height: `${(1 + ACTIVE_VH) * 100}dvh` }}
      >
        <div
          ref={ref}
          className="Location2-retreat sticky top-0 flex flex-col items-center md:static md:h-dvh md:w-dvw md:shrink-0"
        >
          <div className="Retreat-col-2 relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden p-2.5 md:h-full md:flex-1">
            <LocationCard
              activeIndex={window.innerWidth < 768 ? mobileActiveIndex : activeIndex}
              onStepClick={scrollToLocation2RetreatSlide}
              onBookNow={onBookNow}
              quote={
                'Where earth meets water, a profound sense of "I am here" naturally arises.'
              }
              locationLabel="Location 2"
              nameLines={['The', 'Island Retreat']}
            />
            <LocationSlider
              baseSrc={baseImg}
              slides={SLIDES}
              setSlideRef={setLocalSlideRef}
            />
          </div>
        </div>
      </div>
    )
  },
)

export default Location2Retreat
