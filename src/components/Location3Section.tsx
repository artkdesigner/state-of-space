import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
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

const SLIDE_COUNT = 3
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Первый ENTRANCE_VH вьюпорта СОБСТВЕННОГО пина Location3 (пока Location2
 * ещё дописывает свой хвост в обычном document flow прямо под ней) — секция
 * наезжает сбоку: translateX едет от 100% (полностью за правым краем) до 0%
 * (на месте), скругление левых углов — от накрытого CSS-капом значения
 * (эффект «таблетки») до 0, синхронно с тем же прогрессом. Дальше, до конца
 * пина, идёт уже существовавший кроссфейд слайдов (см. splitProgress ниже). */
const ENTRANCE_VH = 100

/** Кадры 1..5 из Figma-сцены «Location2 to Location3», взятые как точки
 * прогресса 0/0.25/0.5/0.75/1 внутри ENTRANCE_VH (тот же принцип, что
 * CAROUSEL_KEYFRAMES в BeyondSection.tsx). translateX — % от СОБСТВЕННОЙ
 * ширины Location3 (x-позиция кадра / ширина Figma-фрейма 1920), поэтому
 * одинаково прикладывается на любом брейкпоинте. radius — % от высоты
 * (border-radius кадра / высота фрейма 1080) в `dvh`: `dvh`, в отличие от
 * rem/%, всегда пропорционален РЕАЛЬНОЙ высоте Location3 (`h-dvh`) на любом
 * брейкпоинте/устройстве — именно так же, как в Figma радиус в px был
 * привязан к фиксированной высоте фрейма. Первые два кадра (92.5926) сами
 * по себе превышают половину высоты — CSS одинаково скругляет (капает) оба
 * до классической «таблетки», это и есть визуальные «50%». */
const ENTRANCE_KEYFRAMES: { translateX: number; radius: number }[] = [
  { translateX: 100, radius: 92.5926 },
  { translateX: 80.2083, radius: 92.5926 },
  { translateX: 48.6458, radius: 46.2963 },
  { translateX: 16.4063, radius: 18.5185 },
  { translateX: 0, radius: 0 },
]

/** Хвост собственного пина, ПОСЛЕ того как кроссфейд слайдов уже доигран —
 * Location3 просто держится неподвижно (уже приклеена), пока ResidenceSection.tsx
 * (следующий сиблинг, подтянутый своим собственным `margin-top: -100vh`)
 * наезжает поверх неё снизу — тот же приём, что Cliff/Location1 (см.
 * CliffSection.tsx). Без этого хвоста Location3 отклеилась бы и укатилась
 * прежде, чем Residence успела бы наехать поверх ещё видимой Location3. */
const DWELL_VH = 100

/** Кусочно-линейная интерполяция (со smoothstep внутри каждого отрезка) —
 * тот же приём, что sampleCarousel в BeyondSection.tsx: сохраняет
 * неравномерность самой Figma-анимации (например, между кадром 1 и 2
 * радиус ещё не меняется, едет только позиция), а не сглаживает её одной
 * кривой через все 5 точек. */
function sampleEntrance(progress: number) {
  const segments = ENTRANCE_KEYFRAMES.length - 1
  const scaled = gsap.utils.clamp(0, 1, progress) * segments
  const i = Math.min(segments - 1, Math.floor(scaled))
  const local = smoothstep(scaled - i)
  const a = ENTRANCE_KEYFRAMES[i]
  const b = ENTRANCE_KEYFRAMES[i + 1]
  return {
    translateX: a.translateX + (b.translateX - a.translateX) * local,
    radius: a.radius + (b.radius - a.radius) * local,
  }
}

type Location3SectionProps = {
  onBookNow: () => void
}

export default function Location3Section({ onBookNow }: Location3SectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  /* Location3 приклеена вверху (`position: sticky; top: 0` внутри
   * Location3-pin-wrap высотой (100 + ENTRANCE_VH + SLIDE_COUNT*100 +
   * DWELL_VH) вьюпортов, сдвинутой на `margin-top: -100vh` — тот же приём,
   * что у Cliff-pin-wrap/Location1-pin-wrap (см. CliffSection.tsx): margin
   * утягивает документный верх Location3-wrap ровно на ENTRANCE_VH раньше,
   * чем закончился бы Location2 "по прямому потоку" — Location2Section.tsx
   * держит свой собственный пин ровно на эту же LOCATION3_ENTRANCE_VH
   * дистанцию дольше специально под это (см. константу там). Раньше здесь
   * не было margin вообще — Location3 просто шла обычным потоком после
   * Location2, и `'top top'` совпадал с моментом, когда Location2 УЖЕ
   * полностью уехала: сбоку-наезд начинался только после того, как
   * Location2 исчезала, а не поверх ещё видимой (неподвижной) Location2,
   * как должно быть по макету (баг, на который пожаловался пользователь).
   * `'top top'` по-прежнему работает буквально (GSAP сам учитывает margin
   * в естественной doc-flow позиции wrap'а и пересчитывает её на refresh),
   * без отдельного getBoundingClientRect-хелпера, как в Location1/Cliff —
   * там он нужен из-за компенсации ещё не приклеенного бокса, тут в этом
   * нет необходимости: единственное, что меняется — ГДЕ (раньше/позже)
   * наступает штатный sticky-стик, а не что происходит до него. Собственный
   * пин разбит на 2
   * последовательные фазы (тот же приём splitProgress, что в
   * Location2Section.tsx): первые ENTRANCE_VH — наезд сбоку (translateX +
   * скругление левых углов, см. ENTRANCE_KEYFRAMES выше), дальше —
   * уже существовавший кроссфейд SLIDE_COUNT слайдов, который стартует
   * только после того, как наезд полностью завершён. */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    if (!wrap || !section) return

    const start = sampleEntrance(0)
    section.style.transform = `translateX(${start.translateX}%)`
    section.style.borderTopLeftRadius = `${start.radius}dvh`
    section.style.borderBottomLeftRadius = `${start.radius}dvh`

    const TOTAL_VH = ENTRANCE_VH + SLIDE_COUNT * 100 + DWELL_VH

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (TOTAL_VH / 100),
      scrub: true,
      onUpdate: (self) => {
        const vhScrolled = self.progress * TOTAL_VH

        const entranceProgress = gsap.utils.clamp(
          0,
          1,
          vhScrolled / ENTRANCE_VH,
        )
        const { translateX, radius } = sampleEntrance(entranceProgress)
        section.style.transform = `translateX(${translateX}%)`
        section.style.borderTopLeftRadius = `${radius}dvh`
        section.style.borderBottomLeftRadius = `${radius}dvh`

        // Кроссфейд слайдов — фиксированный SLIDE_COUNT*100 бюджет сразу
        // после ENTRANCE_VH, независимо от хвоста DWELL_VH дальше.
        const progress = gsap.utils.clamp(
          0,
          1,
          (vhScrolled - ENTRANCE_VH) / (SLIDE_COUNT * 100),
        )

        // Верхний слайд i плавно гаснет вокруг границы (i+1)/SLIDE_COUNT,
        // открывая слайд i+1, лежащий под ним в стеке.
        for (let i = 0; i < SLIDE_COUNT - 1; i++) {
          const boundary = (i + 1) / SLIDE_COUNT
          const from = boundary - CROSSFADE / 2
          const to = boundary + CROSSFADE / 2
          const local = gsap.utils.clamp(0, 1, (progress - from) / (to - from))
          const el = slideEls.current[i]
          if (el) el.style.opacity = String(1 - smoothstep(local))
        }

        const index = Math.min(
          SLIDE_COUNT - 1,
          Math.floor(progress * SLIDE_COUNT),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => {
      trigger.kill()
      section.style.transform = ''
      section.style.borderTopLeftRadius = ''
      section.style.borderBottomLeftRadius = ''
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Location3-pin-wrap relative bg-light"
      style={{
        height: `${100 + ENTRANCE_VH + SLIDE_COUNT * 100 + DWELL_VH}vh`,
        marginTop: '-100vh',
      }}
    >
      <section
        id="location3"
        ref={sectionRef}
        className="Location3 sticky top-0 isolate flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
      >
        <LocationCard
          activeIndex={activeIndex}
          onBookNow={onBookNow}
          quote={
            'Where earth meets water, a profound sense of "I am here" naturally arises.'
          }
          locationLabel="Location 3"
          nameLines={['The Water Residence']}
        />
        <LocationSlider
          baseSrc={baseImg}
          slides={SLIDES}
          setSlideRef={setSlideRef}
        />
      </section>
    </div>
  )
}
