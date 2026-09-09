import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Location2Retreat from './Location2Retreat'
import Location2Galery from './Location2Galery'
import Location2About from './Location2About'
import Location2History from './Location2History'
import Location2Pillars from './Location2Pillars'
import Location2Balance from './Location2Balance'
import Location3Panel from './Location3Panel'

gsap.registerPlugin(ScrollTrigger)

const SLIDE_COUNT = 3
/** Доля прогресса ретрит-панели, за которую верхний слайд успевает уйти —
 * тот же приём, что в Location1Section. */
const CROSSFADE = 0.28
/** То же самое, но для слайдов Location3Panel — своя переменная, потому что
 * у неё своя, отдельная от Retreat, фаза кроссфейда (см. LOCATION3_SLIDE_COUNT
 * ниже). */
const LOCATION3_SLIDE_COUNT = 3

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Только desktop (lg, см. Location2Galery.tsx): бюджет скролла на «сжатие»
 * Galery-col-2, пока трек стоит на месте на уже полностью въехавшей
 * Location2-galery (см. покадровую сцену «Анимация внутри Location2»
 * 1..5 в Figma) — тот же приём "трек стоит, двигается только один
 * внутренний элемент", что и у кроссфейда слайдов ниже. */
const SQUEEZE_VH = 150
/** Galery-col-2 в состоянии покоя (кадр 3, только что доехавшая галерея,
 * col-1/3 ещё полностью спрятаны за края) — 120rem/20rem/6.25rem =
 * 1920/320/100px на Figma-фрейме 1920×1080. */
const GALERY_COL2_REST = { width: 120, paddingX: 20, paddingY: 6.25 }
/** Galery-col-2 в осевшем состоянии (кадр 4) — 38.375rem = 614px, ровно
 * то, что остаётся 1920 minus фиксированные col-1/3 (38.3125rem каждая) и
 * гэпы/паддинги (1.25rem) — то же число, что даёт `flex: 1 0 0` в макете,
 * просто без раннтайм-измерения. paddingY = 60px = 3.75rem. */
const GALERY_COL2_SETTLED = { width: 38.375, paddingX: 0, paddingY: 3.75 }

/** Хвостовой запас пина (в vh), после того как трек (включая Location3Panel,
 * последнюю панель) уже полностью доехал и её собственный кроссфейд слайдов
 * доигран — держит Location2 приклеенной ещё на эту дистанцию, пока
 * ResidenceSection.tsx (следующий сиблинг, подтянутый своим собственным
 * `margin-top: -100vh`) наезжает поверх неё снизу, а не после того как
 * Location2 уже уехала (тот же приём хвоста, что у Cliff/Above/Location1,
 * см. CliffSection.tsx). Должно совпадать с RISE_VH в ResidenceSection.tsx. */
const RESIDENCE_DWELL_VH = 100

type Location2SectionProps = {
  onBookNow: () => void
}

export default function Location2Section({ onBookNow }: Location2SectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const retreatRef = useRef<HTMLDivElement>(null)
  const galeryCol2Ref = useRef<HTMLDivElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const location3SlideEls = useRef<(HTMLDivElement | null)[]>([])
  const [location3ActiveIndex, setLocation3ActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }
  const setLocation3SlideRef = (index: number) => (el: HTMLDivElement | null) => {
    location3SlideEls.current[index] = el
  }

  /* Горизонтальный скролл-скраб активен только на tablet/desktop (md+) —
   * на mobile секция обычный вертикальный поток без пина/sticky вообще.
   * Location2 — `position: sticky; top: 0` внутри Location2-pin-wrap, чья
   * высота, в отличие от остальных секций в цепочке, не константная (в
   * vh), а считается в px из РЕАЛЬНОЙ ширины трека (getDistance) — задаём
   * её императивно и пересчитываем на resize (см. updateHeight/onResize
   * ниже), а не статическим style при рендере.
   *
   * На desktop (lg) в трек между Location2-retreat и Location2-about
   * встроена Location2-galery (см. Location2Galery.tsx) — её самой не
   * видно на tablet (`hidden lg:flex`), поэтому там её ширина = 0 и
   * getDistance() естественно её не учитывает, а весь SQUEEZE_VH-бюджет
   * ниже просто не нужен: tablet и desktop поэтому разведены на два
   * отдельных gsap.matchMedia-блока, а не на одну общую ветку с if — тело
   * анимации отличается слишком сильно (третья, «сжимающая» фаза), чтобы
   * различать её на лету было проще, чем повторить блок целиком.
   *
   * Location3Panel.tsx — последняя панель трека (Location2 → Location3
   * теперь один непрерывный горизонтальный поток, а не отдельная секция со
   * своим вертикальным пином и наездом сбоку — убрано по просьбе
   * пользователя, см. комментарий в Location3Panel.tsx): getDistance()
   * автоматически растёт на её ширину, обычная трек-анимация довозит её
   * так же, как и любую другую панель, никакого отдельного механизма не
   * нужно. У неё своя, отдельная от Retreat, фаза кроссфейда слайдов —
   * см. runLocation3Crossfade и LOCATION3_SLIDE_COUNT — которая стартует
   * только после того, как трек уже целиком докатился (Location3Panel
   * полностью в кадре). RESIDENCE_DWELL_VH — хвостовой запас после этого,
   * под наезд ResidenceSection.tsx (см. константу выше). */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const track = trackRef.current
    if (!wrap || !section || !track) return

    const mm = gsap.matchMedia()

    const runCrossfade = (local: number) => {
      for (let i = 0; i < SLIDE_COUNT - 1; i++) {
        const boundary = (i + 1) / SLIDE_COUNT
        const from = boundary - CROSSFADE / 2
        const to = boundary + CROSSFADE / 2
        const t = gsap.utils.clamp(0, 1, (local - from) / (to - from))
        const el = slideEls.current[i]
        if (el) el.style.opacity = String(1 - smoothstep(t))
      }

      const index = Math.min(SLIDE_COUNT - 1, Math.floor(local * SLIDE_COUNT))
      setActiveIndex((prev) => (prev === index ? prev : index))
    }

    // Тот же приём, что runCrossfade выше, но для слайдов Location3Panel —
    // её собственная фаза кроссфейда идёт ПОСЛЕ того, как трек уже целиком
    // докатился (см. splitLocation3Crossfade/afterTrackPx ниже).
    const runLocation3Crossfade = (local: number) => {
      for (let i = 0; i < LOCATION3_SLIDE_COUNT - 1; i++) {
        const boundary = (i + 1) / LOCATION3_SLIDE_COUNT
        const from = boundary - CROSSFADE / 2
        const to = boundary + CROSSFADE / 2
        const t = gsap.utils.clamp(0, 1, (local - from) / (to - from))
        const el = location3SlideEls.current[i]
        if (el) el.style.opacity = String(1 - smoothstep(t))
      }

      const index = Math.min(
        LOCATION3_SLIDE_COUNT - 1,
        Math.floor(local * LOCATION3_SLIDE_COUNT),
      )
      setLocation3ActiveIndex((prev) => (prev === index ? prev : index))
    }

    mm.add('(min-width: 48rem) and (max-width: 61.9375rem)', () => {
      const getDistance = () => track.scrollWidth - window.innerWidth
      /** Отдельный бюджет скролла на кроссфейд трёх фото ретрит-панели —
       * трек всё это время стоит на месте (x: 0), и только после того как
       * кроссфейд долистан до конца, начинается горизонтальный переезд к
       * Location2-about. Тот же приём "N × высота экрана на слайд", что и у
       * Location1Section.tsx и у LOCATION3_SLIDE_COUNT ниже. */
      const getCrossfadeBudget = () => window.innerHeight * SLIDE_COUNT
      const getLocation3CrossfadeBudget = () =>
        window.innerHeight * LOCATION3_SLIDE_COUNT
      const getResidenceDwellBudget = () =>
        window.innerHeight * (RESIDENCE_DWELL_VH / 100)
      const getPinDistance = () =>
        getCrossfadeBudget() +
        getDistance() +
        getLocation3CrossfadeBudget() +
        getResidenceDwellBudget()

      const updateHeight = () => {
        wrap.style.height = `${section.offsetHeight + getPinDistance()}px`
      }
      updateHeight()

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: () => '+=' + getPinDistance(),
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const distance = getDistance()
          const crossfadeBudget = getCrossfadeBudget()
          const location3CrossfadeBudget = getLocation3CrossfadeBudget()
          const total = getPinDistance()
          if (!distance || !total) return

          const splitCrossfade = crossfadeBudget / total
          // Конец фазы 2 (горизонтальный переезд трека).
          const splitDistance = (crossfadeBudget + distance) / total
          // Конец фазы 3 (кроссфейд слайдов Location3Panel) — сразу после
          // неё остаётся только RESIDENCE_DWELL_VH хвост-запас (см.
          // константу выше), ничего уже не меняется.
          const splitLocation3Crossfade =
            (crossfadeBudget + distance + location3CrossfadeBudget) / total

          // Фаза 1 (0 → splitCrossfade): кроссфейд слайдов Retreat, трек
          // неподвижен.
          runCrossfade(gsap.utils.clamp(0, 1, self.progress / splitCrossfade))

          // Фаза 2 (splitCrossfade → splitDistance): горизонтальный переезд
          // трека, начинается только после того как кроссфейд завершён —
          // довозит все панели, включая Location3Panel, последнюю в треке.
          const scrollLocal = gsap.utils.clamp(
            0,
            1,
            (self.progress - splitCrossfade) / (splitDistance - splitCrossfade),
          )
          gsap.set(track, { x: -distance * scrollLocal })

          // Фаза 3 (splitDistance → splitLocation3Crossfade): трек уже
          // целиком докатился (Location3Panel полностью в кадре) — теперь
          // кроссфейд её собственных слайдов.
          const location3Local = gsap.utils.clamp(
            0,
            1,
            (self.progress - splitDistance) /
              (splitLocation3Crossfade - splitDistance),
          )
          runLocation3Crossfade(location3Local)
        },
      })

      const onResize = () => {
        updateHeight()
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
        trigger.kill()
        wrap.style.height = ''
      }
    })

    mm.add('(min-width: 62rem)', () => {
      const col2 = galeryCol2Ref.current

      const getDistance = () => track.scrollWidth - window.innerWidth
      const getCrossfadeBudget = () => window.innerHeight * SLIDE_COUNT
      const getRetreatWidth = () => retreatRef.current?.offsetWidth ?? 0
      const getSqueezeBudget = () => window.innerHeight * (SQUEEZE_VH / 100)
      const getLocation3CrossfadeBudget = () =>
        window.innerHeight * LOCATION3_SLIDE_COUNT
      const getResidenceDwellBudget = () =>
        window.innerHeight * (RESIDENCE_DWELL_VH / 100)
      const getPinDistance = () =>
        getCrossfadeBudget() +
        getDistance() +
        getSqueezeBudget() +
        getLocation3CrossfadeBudget() +
        getResidenceDwellBudget()

      const setCol2 = (t: number) => {
        if (!col2) return
        const eased = smoothstep(t)
        const width =
          GALERY_COL2_REST.width +
          (GALERY_COL2_SETTLED.width - GALERY_COL2_REST.width) * eased
        const paddingX =
          GALERY_COL2_REST.paddingX +
          (GALERY_COL2_SETTLED.paddingX - GALERY_COL2_REST.paddingX) * eased
        const paddingY =
          GALERY_COL2_REST.paddingY +
          (GALERY_COL2_SETTLED.paddingY - GALERY_COL2_REST.paddingY) * eased
        col2.style.width = `${width}rem`
        col2.style.paddingLeft = col2.style.paddingRight = `${paddingX}rem`
        col2.style.paddingTop = col2.style.paddingBottom = `${paddingY}rem`
      }

      const updateHeight = () => {
        wrap.style.height = `${section.offsetHeight + getPinDistance()}px`
      }
      updateHeight()
      setCol2(0)

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: () => '+=' + getPinDistance(),
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const distance = getDistance()
          const crossfadeBudget = getCrossfadeBudget()
          const retreatWidth = getRetreatWidth()
          const squeezeBudget = getSqueezeBudget()
          const location3CrossfadeBudget = getLocation3CrossfadeBudget()
          // getPinDistance(), не локальная сумма — включает ещё и хвостовые
          // LOCATION3_SLIDE_COUNT/RESIDENCE_DWELL_VH запасы (см. константы
          // выше), иначе доли splitCrossfade/scrolledPx съезжали бы
          // относительно реального конца триггера (`end`, тоже посчитанного
          // через getPinDistance()).
          const total = getPinDistance()
          if (!distance || !total) return

          const splitCrossfade = crossfadeBudget / total

          // Фаза 1 (0 → splitCrossfade): кроссфейд слайдов, трек неподвижен.
          runCrossfade(
            gsap.utils.clamp(0, 1, self.progress / splitCrossfade),
          )

          // Дальше работаем в пикселях самого скролла, а не в долях
          // прогресса — так проще воткнуть внутри трек-переезда третью,
          // "замершую" фазу сжатия Galery-col-2 (см. SQUEEZE_VH выше).
          const scrolledPx = self.progress * total
          const afterCrossfadePx = Math.max(0, scrolledPx - crossfadeBudget)

          let trackPx: number
          let squeezeProgress: number
          if (afterCrossfadePx <= retreatWidth) {
            // Фаза 2: Location2-retreat уезжает, Location2-galery въезжает
            // (кадры 1→2→3 сцены) — обычный трек-переезд на 1 вьюпорт.
            trackPx = afterCrossfadePx
            squeezeProgress = 0
          } else if (afterCrossfadePx <= retreatWidth + squeezeBudget) {
            // Фаза 3: трек застыл на уже целиком въехавшей галерее, пока
            // Galery-col-2 сужается и открывает col-1/col-3 (кадры 3→4).
            trackPx = retreatWidth
            squeezeProgress = (afterCrossfadePx - retreatWidth) / squeezeBudget
          } else {
            // Фаза 4: сжатие уже доиграно (col-1/2/3 замерли как на кадре
            // 4), трек продолжает переезд — Location2-galery уезжает,
            // дальше идут About/History/Pillars/Balance и, наконец,
            // Location3Panel, последняя панель трека.
            trackPx = afterCrossfadePx - squeezeBudget
            squeezeProgress = 1
          }

          gsap.set(track, { x: -gsap.utils.clamp(0, distance, trackPx) })
          setCol2(squeezeProgress)

          // Фаза 5: трек уже целиком докатился (trackPx достиг distance,
          // Location3Panel полностью в кадре) — теперь кроссфейд её
          // собственных слайдов.
          const afterTrackPx = Math.max(
            0,
            afterCrossfadePx - squeezeBudget - distance,
          )
          const location3Local = gsap.utils.clamp(
            0,
            1,
            afterTrackPx / location3CrossfadeBudget,
          )
          runLocation3Crossfade(location3Local)
        },
      })

      const onResize = () => {
        updateHeight()
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
        trigger.kill()
        wrap.style.height = ''
        if (col2) {
          col2.style.width = ''
          col2.style.paddingLeft = ''
          col2.style.paddingRight = ''
          col2.style.paddingTop = ''
          col2.style.paddingBottom = ''
        }
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={wrapRef} className="Location2-pin-wrap relative">
      <section
        id="location2"
        ref={sectionRef}
        className="Location2 sticky top-0 bg-light md:overflow-hidden"
      >
        <div
          ref={trackRef}
          className="Location2-track flex flex-col md:flex-row md:items-stretch"
        >
          <Location2Retreat
            ref={retreatRef}
            activeIndex={activeIndex}
            onBookNow={onBookNow}
            setSlideRef={setSlideRef}
          />
          <Location2Galery
            col2Ref={(el) => {
              galeryCol2Ref.current = el
            }}
          />
          <Location2About />
          <Location2History />
          <Location2Pillars />
          <Location2Balance onBookNow={onBookNow} />
          <Location3Panel
            activeIndex={location3ActiveIndex}
            onBookNow={onBookNow}
            setSlideRef={setLocation3SlideRef}
          />
        </div>
      </section>
    </div>
  )
}
