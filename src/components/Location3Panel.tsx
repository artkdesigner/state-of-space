import { forwardRef, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import { scrollToLocation3Slide, setLocation3MobileImpl } from './Location2Section'
import { scrollToY } from '../lib/scroll'
import baseImg from '../assets/location3-slider-base.webp'
import slide1 from '../assets/location3-slide-1.webp'
import slide2 from '../assets/location3-slide-2.webp'
import slide3 from '../assets/location3-slide-3.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Water Residence yacht deck at sunset, hills rising across the water',
  },
  {
    src: slide2,
    alt: 'The Water Residence yacht cruising along the coastline',
  },
  {
    src: slide3,
    alt: 'The Water Residence yacht deck seating overlooking the sea',
  },
]

/** На mobile (< 48rem) у Location3 нет наезда/трека от Location2Section
 * (там вообще нет пина на mobile, см. её комментарий) — раньше это
 * означало, что слайды 2/3 физически нечем было показать (жалоба
 * пользователя: "location3 в мобильной версии незапинен, пролистывается
 * без смены слайдов"). По прямой просьбе пользователя (сравнили со
 * вариантом "только клик по степперу") — на mobile у Location3 теперь
 * свой собственный, полностью самодостаточный pin + ScrollTrigger
 * крестфейд, тот же приём, что PIN_VH/ACTIVE_VH/LAST_CROSSFADE_END в
 * Location1Section.tsx (тот же темп кроссфейда). "Голый" пин (без
 * margin-top наезда, см. AdvantagesSection.tsx) — сама передача места
 * Balance → Location3 → Residence на mobile не менялась, только
 * добавился внутренний скролл-бюджет НА САМ Location3. */
const SLIDE_COUNT = 3
const CROSSFADE = 0.28
const LAST_CROSSFADE_END = (SLIDE_COUNT - 1) / SLIDE_COUNT + CROSSFADE / 2
const ACTIVE_VH = SLIDE_COUNT * LAST_CROSSFADE_END

const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location3PanelProps = {
  activeIndex: number
  onBookNow: () => void
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

/** Панель Location3 — НЕ часть флекс-трека Location2Section.tsx (см. её
 * JSX: сиблинг `Location2-track`, не его ребёнок), `md:absolute md:inset-0
 * md:z-20` — по прямой просьбе пользователя должна физически НАЕЗЖАТЬ
 * поверх уже неподвижной Balance, а не просто идти следующей панелью в
 * общей ленте (соседство в ленте не даёт перекрытия — трек просто
 * продолжает катиться, Balance уезжает влево, а не остаётся видна под
 * Location3). На mobile (нет `md:`-переопределений у самой секции) она
 * по-прежнему обычный блок в вертикальном document flow относительно
 * соседей (Balance/Residence) — только теперь sticky сама по себе, на
 * время собственного слайд-кроссфейда (см. Location3-pin-wrap ниже).
 *
 * Раньше это была отдельная Location3Section.tsx со своим ВЕРТИКАЛЬНЫМ
 * пином и наездом сбоку — убрана по прошлой просьбе пользователя:
 * отдельный вертикальный пин с ручным наездом поверх ещё едущего
 * Location2 давал шов (пустой фон Location3-pin-wrap на мгновение
 * перекрывал Balance ДО того, как начинался сам наезд). Текущая версия
 * того шва не имеет: Location3Panel всегда красится actual transform/
 * border-radius значениями (см. Location2Section.tsx `setLocation3Overlay`
 * — translateX 100%→0% + скругление левых углов 50%→0%, тот же приём,
 * что был у старой Location3Section, просто без отдельного pin-wrap) —
 * никогда не показывается в невизуализированном "дефолтном" виде,
 * поэтому шва физически неоткуда взяться. `overflow-hidden` в className —
 * не только клипует левые углы под радиус, но и прячет саму панель, пока
 * она ещё translateX(100%) (полностью за правым краем `section`, см.
 * `md:overflow-hidden` там же). Ref нужен для этого же inline-управления
 * (transform/radius) из Location2Section.tsx — Location3-pin-wrap ниже
 * `md:contents` (не участвует в layout на md+ вообще), поэтому не меняет,
 * относительно чего эти md+ absolute/transform считаются. */
const Location3Panel = forwardRef<HTMLElement, Location3PanelProps>(
  function Location3Panel({ activeIndex, onBookNow, setSlideRef }, ref) {
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

      // Клик по Location-step (см. LocationCard.tsx) — та же формула
      // "середина виртуального PIN_VH-широкого окна слайда", что
      // handleStepClick в Location1Section.tsx. Регистрируется как
      // mobile-реализация scrollToLocation3Slide (см.
      // setLocation3MobileImpl в Location2Section.tsx) — снаружи (NavBar/
      // NavMenu/Footer) её вызывают той же функцией, что и на md+, разница
      // только в том, какая реализация сейчас активна.
      setLocation3MobileImpl((index: number) => {
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
        setLocation3MobileImpl(null)
      }
    }, [])

    return (
      <div
        ref={wrapRef}
        className="Location3-pin-wrap relative md:contents"
        style={{ height: `${(1 + ACTIVE_VH) * 100}dvh` }}
      >
        <section
          id="location3"
          ref={ref}
          className="Location3 sticky top-0 flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 md:relative md:h-auto md:w-auto md:absolute md:inset-0 md:z-20 lg:px-5 lg:pt-30 lg:pb-5"
        >
          <LocationCard
            activeIndex={window.innerWidth < 768 ? mobileActiveIndex : activeIndex}
            onStepClick={scrollToLocation3Slide}
            onBookNow={onBookNow}
            quote={
              'With water all around, a profound sense of freedom naturally comes into focus.'
            }
            locationLabel="Location 3"
            nameLines={['The Water Residence']}
          />
          <LocationSlider
            baseSrc={baseImg}
            slides={SLIDES}
            setSlideRef={setLocalSlideRef}
          />
        </section>
      </div>
    )
  },
)

export default Location3Panel
