import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToY } from '../lib/scroll'
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
/** Скролл-дистанция наезда Location3Panel поверх Balance, в высотах
 * вьюпорта — отдельный бюджет, СРАЗУ после того как трек (уже БЕЗ
 * Location3Panel, см. комментарий у useEffect ниже) целиком докатился и
 * Balance стоит полностью в кадре. См. setLocation3Overlay. */
const LOCATION3_ENTRANCE_VH = 200

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

/** Tablet (md, см. Location2Galery.tsx): тот же приём, что SQUEEZE_VH/
 * GALERY_COL2_REST/SETTLED выше, только по вертикали — Galery-col-2
 * (Galery-img-3) въезжает на весь экран, потом "садится" до 1/3 высоты,
 * открывая col-1/col-3 сверху/снизу. Числа — из двух выделенных
 * пользователем Figma-кадров сцены «Location2-galery» на tablet-фрейме
 * 768×1024: кадр 1 (col-2 h=1002px=62.625rem, во весь экран) и кадр 2
 * (все три строки поровну, 328px=20.5rem). Без paddingX/Y — на этом
 * фрейме Galery-img-3 в обоих кадрах заполняет col-2 без отступов (в
 * отличие от desktop, см. GALERY_COL2_REST/SETTLED). Тот же бюджет
 * SQUEEZE_VH, что и у desktop — отдельного числа под tablet в макете нет,
 * это чисто скролл-таймингу, не геометрия конкретного кадра. */
const TABLET_SQUEEZE_VH = SQUEEZE_VH
const TABLET_GALERY_COL2_REST_HEIGHT = 62.625
const TABLET_GALERY_COL2_SETTLED_HEIGHT = 20.5

/** Хвостовой запас пина (в vh), после того как трек (включая Location3Panel,
 * последнюю панель) уже полностью доехал и её собственный кроссфейд слайдов
 * доигран — держит Location2 приклеенной ещё на эту дистанцию, пока
 * ResidenceSection.tsx (следующий сиблинг, подтянутый своим собственным
 * `margin-top: -100vh`) наезжает поверх неё снизу, а не после того как
 * Location2 уже уехала (тот же приём хвоста, что у Cliff/Above/Location1,
 * см. CliffSection.tsx). Должно совпадать с RISE_VH в ResidenceSection.tsx. */
const RESIDENCE_DWELL_VH = 100

/** Императивный переход к Location2-about из навбара (по прямой просьбе
 * пользователя) — тот же приём, что `externalSetTheme` в NavBar.tsx:
 * простой `<a href="#location2-about">`/scrollIntoView тут не работает,
 * её "истинная" вертикальная позиция зависит от того, сколько ещё
 * горизонтального прогресса трека нужно докрутить (см. useEffect ниже),
 * а не от статичного doc-offset. На mobile (нет пина/трека вообще, см.
 * комментарий у useEffect) остаётся null — там About уже стоит обычным
 * блоком в document flow, годится простой anchor-скролл, см. вызывающую
 * сторону (NavBar.tsx). */
let scrollToAboutImpl: (() => void) | null = null
export function scrollToLocation2About() {
  scrollToAboutImpl?.()
}

/** То же самое для Location-step внутри Location2Retreat.tsx/Location3Panel.tsx
 * (см. LocationCard.tsx `onStepClick`) — по прямой просьбе пользователя
 * ("сделал кликабельными Location-step во всех элементах Location?", до
 * этого клик работал только у Location1Section, а Retreat/Location3 так и
 * оставались некликабельными). Тот же приём, что scrollToAboutImpl: обе
 * панели анимируются только md+ (см. комментарий у useEffect ниже — на
 * mobile нет ни пина, ни трека), поэтому на mobile остаются null и
 * LocationCard рендерит некликабельные степы, как и раньше (см. её
 * optional `onStepClick?`). */
let scrollToRetreatSlideImpl: ((index: number) => void) | null = null
export function scrollToLocation2RetreatSlide(index: number) {
  scrollToRetreatSlideImpl?.(index)
}
let scrollToLocation3SlideImpl: ((index: number) => void) | null = null
export function scrollToLocation3Slide(index: number) {
  scrollToLocation3SlideImpl?.(index)
}

type Location2SectionProps = {
  onBookNow: () => void
}

export default function Location2Section({ onBookNow }: Location2SectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const retreatRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const galeryCol2Ref = useRef<HTMLDivElement>(null)
  const location3Ref = useRef<HTMLElement>(null)
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
   * Location3Panel.tsx — НЕ панель трека (не флекс-child `track`, см. JSX
   * ниже — она сиблинг трека внутри `section`, `md:absolute md:inset-0`,
   * поверх него) — по просьбе пользователя должна физически НАЕЗЖАТЬ
   * поверх Balance, а не просто идти следующей панелью в общей ленте
   * (обычная лента даёт соседство, а не перекрытие). getDistance()
   * поэтому её ширину больше не учитывает вообще (трек оканчивается на
   * Balance) — сразу после того как трек целиком докатился (см.
   * LOCATION3_ENTRANCE_VH-фазу ниже), Location3Panel отдельным
   * translateX 100%→0% (плюс скругление левых углов 50%→0%, см.
   * setLocation3Overlay) заезжает по диагонали поверх уже неподвижного,
   * полностью видимого Balance — тот же визуальный эффект, что был у
   * старой отдельной Location3Section.tsx с собственным вертикальным
   * пином (см. её git-историю), но БЕЗ отдельного pin-wrap и связанного с
   * ним шва (пустой фон на миг перекрывал Balance ДО начала наезда) —
   * Location3Panel всегда красится значениями transform/border-radius,
   * никогда не показывается в невизуализированном "дефолтном" виде.
   * Следом — её собственная, отдельная от Retreat, фаза кроссфейда
   * слайдов (см. runLocation3Crossfade/LOCATION3_SLIDE_COUNT).
   * RESIDENCE_DWELL_VH — хвостовой запас после всего этого, под наезд
   * ResidenceSection.tsx (см. константу выше). */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const track = trackRef.current
    const about = aboutRef.current
    const location3 = location3Ref.current
    if (!wrap || !section || !track || !about || !location3) return

    const mm = gsap.matchMedia()

    // Наезд Location3Panel поверх Balance — translateX 100%→0% (полностью
    // за правым краем → на месте, поверх Balance) вместе со скруглением
    // левых углов 50%→0% (та же идея "разворачивающейся карточки", что и
    // у Capacity/Cliff в остальном проекте). Управляется отдельным
    // LOCATION3_ENTRANCE_VH-бюджетом (см. onUpdate ниже), не завязана на
    // trackPx/distance — Location3Panel больше не часть трека.
    const setLocation3Overlay = (t: number) => {
      const eased = smoothstep(gsap.utils.clamp(0, 1, t))
      location3.style.transform = `translateX(${(1 - eased) * 100}%)`
      // vmin, не % — Location3 (viewport-sized на всех брейкпоинтах, см.
      // её className) не квадратная, а border-radius в `%` считается
      // отдельно от ширины и от высоты: угол получался вытянутым эллипсом
      // вместо ровной дуги на tablet/mobile (жалоба пользователя, см. ту
      // же правку в QualitiesSection.tsx/CliffSection.tsx).
      const radius = `${50 * (1 - eased)}vmin`
      location3.style.borderTopLeftRadius = radius
      location3.style.borderBottomLeftRadius = radius
    }

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
      const col2 = galeryCol2Ref.current

      const getDistance = () => track.scrollWidth - window.innerWidth
      /** Отдельный бюджет скролла на кроссфейд трёх фото ретрит-панели —
       * трек всё это время стоит на месте (x: 0), и только после того как
       * кроссфейд долистан до конца, начинается горизонтальный переезд к
       * Location2-about. Тот же приём "N × высота экрана на слайд", что и у
       * Location1Section.tsx и у LOCATION3_SLIDE_COUNT ниже. */
      const getCrossfadeBudget = () => window.innerHeight * SLIDE_COUNT
      const getRetreatWidth = () => retreatRef.current?.offsetWidth ?? 0
      const getSqueezeBudget = () => window.innerHeight * (TABLET_SQUEEZE_VH / 100)
      const getLocation3EntranceBudget = () =>
        window.innerHeight * (LOCATION3_ENTRANCE_VH / 100)
      const getLocation3CrossfadeBudget = () =>
        window.innerHeight * LOCATION3_SLIDE_COUNT
      const getResidenceDwellBudget = () =>
        window.innerHeight * (RESIDENCE_DWELL_VH / 100)
      const getPinDistance = () =>
        getCrossfadeBudget() +
        getDistance() +
        getSqueezeBudget() +
        getLocation3EntranceBudget() +
        getLocation3CrossfadeBudget() +
        getResidenceDwellBudget()

      const setCol2Height = (t: number) => {
        if (!col2) return
        const eased = smoothstep(t)
        const height =
          TABLET_GALERY_COL2_REST_HEIGHT +
          (TABLET_GALERY_COL2_SETTLED_HEIGHT - TABLET_GALERY_COL2_REST_HEIGHT) *
            eased
        col2.style.height = `${height}rem`
      }

      const updateHeight = () => {
        wrap.style.height = `${section.offsetHeight + getPinDistance()}px`
      }
      updateHeight()
      setCol2Height(0)
      setLocation3Overlay(0)

      // Тот же приём, что в desktop-ветке ниже (см. её комментарий),
      // теперь с тем же squeezeBudget в сумме — Galery-col-2 squeeze
      // добавляет "мёртвую" дистанцию скролла между Retreat и About, как
      // и на desktop.
      scrollToAboutImpl = () => {
        const distance = getDistance()
        if (!distance) return
        const targetTrackPx = gsap.utils.clamp(0, distance, about.offsetLeft)
        const scrolledPx =
          getCrossfadeBudget() + getSqueezeBudget() + targetTrackPx
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }

      // Location-step (см. scrollToLocation2RetreatSlide/scrollToLocation3Slide
      // выше) — то же "прогресс → scrolledPx" обращение формул из onUpdate
      // ниже, что и у scrollToAboutImpl, только для середины окна нужного
      // слайда (тот же приём, что handleStepClick в Location1Section.tsx:
      // `(index + 0.5)` вьюпорта внутри соответствующего budget).
      scrollToRetreatSlideImpl = (index) => {
        const scrolledPx = (index + 0.5) * window.innerHeight
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }
      scrollToLocation3SlideImpl = (index) => {
        const distance = getDistance()
        if (!distance) return
        const local3 = (index + 0.5) / LOCATION3_SLIDE_COUNT
        const scrolledPx =
          getCrossfadeBudget() +
          getSqueezeBudget() +
          distance +
          getLocation3EntranceBudget() +
          local3 * getLocation3CrossfadeBudget()
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }

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
          const location3EntranceBudget = getLocation3EntranceBudget()
          const location3CrossfadeBudget = getLocation3CrossfadeBudget()
          const total = getPinDistance()
          if (!distance || !total) return

          const splitCrossfade = crossfadeBudget / total

          // Фаза 1 (0 → splitCrossfade): кроссфейд слайдов Retreat, трек
          // неподвижен.
          runCrossfade(gsap.utils.clamp(0, 1, self.progress / splitCrossfade))

          // Дальше работаем в пикселях самого скролла, а не в долях
          // прогресса — так проще воткнуть внутри трек-переезда третью,
          // "замершую" фазу сжатия Galery-col-2 (тот же приём, что в
          // desktop-ветке выше, см. её комментарий у SQUEEZE_VH, только
          // squeeze тут по высоте, а не по ширине).
          const scrolledPx = self.progress * total
          const afterCrossfadePx = Math.max(0, scrolledPx - crossfadeBudget)

          let trackPx: number
          let squeezeProgress: number
          if (afterCrossfadePx <= retreatWidth) {
            // Фаза 2: Location2-retreat уезжает, Location2-galery въезжает
            // (Galery-col-2 уже во весь экран, кадр 1 сцены) — обычный
            // трек-переезд на 1 вьюпорт.
            trackPx = afterCrossfadePx
            squeezeProgress = 0
          } else if (afterCrossfadePx <= retreatWidth + squeezeBudget) {
            // Фаза 3: трек застыл на уже целиком въехавшей галерее, пока
            // Galery-col-2 садится и открывает col-1/col-3 сверху/снизу
            // (кадр 1→2 сцены).
            trackPx = retreatWidth
            squeezeProgress = (afterCrossfadePx - retreatWidth) / squeezeBudget
          } else {
            // Фаза 4: сжатие доиграно (col-1/2/3 замерли как на кадре 2),
            // трек продолжает переезд — Location2-galery уезжает, дальше
            // About/History/Pillars/Balance.
            trackPx = afterCrossfadePx - squeezeBudget
            squeezeProgress = 1
          }

          const clampedTrackPx = gsap.utils.clamp(0, distance, trackPx)
          gsap.set(track, { x: -clampedTrackPx })
          setCol2Height(squeezeProgress)

          // Фаза 5: трек уже целиком докатился (Balance полностью в
          // кадре, неподвижна) — теперь Location3Panel наезжает поверх неё.
          const afterTrackPx = Math.max(
            0,
            afterCrossfadePx - squeezeBudget - distance,
          )
          const overlayT = gsap.utils.clamp(
            0,
            1,
            afterTrackPx / location3EntranceBudget,
          )
          setLocation3Overlay(overlayT)

          // Фаза 6: наезд доигран (Location3Panel полностью на месте) —
          // теперь кроссфейд её собственных слайдов.
          const afterEntrancePx = Math.max(
            0,
            afterTrackPx - location3EntranceBudget,
          )
          const location3Local = gsap.utils.clamp(
            0,
            1,
            afterEntrancePx / location3CrossfadeBudget,
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
        if (col2) col2.style.height = ''
        location3.style.transform = ''
        location3.style.borderTopLeftRadius = ''
        location3.style.borderBottomLeftRadius = ''
        scrollToAboutImpl = null
        scrollToRetreatSlideImpl = null
        scrollToLocation3SlideImpl = null
      }
    })

    mm.add('(min-width: 62rem)', () => {
      const col2 = galeryCol2Ref.current

      const getDistance = () => track.scrollWidth - window.innerWidth
      const getCrossfadeBudget = () => window.innerHeight * SLIDE_COUNT
      const getRetreatWidth = () => retreatRef.current?.offsetWidth ?? 0
      const getSqueezeBudget = () => window.innerHeight * (SQUEEZE_VH / 100)
      const getLocation3EntranceBudget = () =>
        window.innerHeight * (LOCATION3_ENTRANCE_VH / 100)
      const getLocation3CrossfadeBudget = () =>
        window.innerHeight * LOCATION3_SLIDE_COUNT
      const getResidenceDwellBudget = () =>
        window.innerHeight * (RESIDENCE_DWELL_VH / 100)
      const getPinDistance = () =>
        getCrossfadeBudget() +
        getDistance() +
        getSqueezeBudget() +
        getLocation3EntranceBudget() +
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
      setLocation3Overlay(0)

      // Императивный переход к Location2-about (см. scrollToLocation2About
      // выше) — та же логика, что onUpdate ниже строит из trackPx, только
      // в обратную сторону: задан целевой trackPx (offsetLeft самой About
      // внутри track — статичная layout-позиция, JS-transform на track её
      // не трогает), нужно восстановить соответствующий scrolledPx. About
      // всегда идёт ПОСЛЕ Retreat/Galery/squeeze, поэтому squeeze уже
      // полностью доигран (squeezeBudget — чистая "мёртвая" дистанция
      // скролла, добавляется целиком, как в фазе 4 onUpdate).
      scrollToAboutImpl = () => {
        const distance = getDistance()
        if (!distance) return
        const targetTrackPx = gsap.utils.clamp(0, distance, about.offsetLeft)
        const scrolledPx =
          getCrossfadeBudget() + getSqueezeBudget() + targetTrackPx
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }

      // Location-step — тот же приём, что у tablet-ветки выше, но со
      // squeezeBudget в сумме (см. её комментарий у onUpdate: "трек уже
      // целиком докатился" на desktop наступает на
      // crossfadeBudget+squeezeBudget+distance, а не crossfadeBudget+distance).
      scrollToRetreatSlideImpl = (index) => {
        const scrolledPx = (index + 0.5) * window.innerHeight
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }
      scrollToLocation3SlideImpl = (index) => {
        const distance = getDistance()
        if (!distance) return
        const local3 = (index + 0.5) / LOCATION3_SLIDE_COUNT
        const scrolledPx =
          getCrossfadeBudget() +
          getSqueezeBudget() +
          distance +
          getLocation3EntranceBudget() +
          local3 * getLocation3CrossfadeBudget()
        const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
        scrollToY(wrapDocTop + scrolledPx)
      }

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
          const location3EntranceBudget = getLocation3EntranceBudget()
          const location3CrossfadeBudget = getLocation3CrossfadeBudget()
          // getPinDistance(), не локальная сумма — включает ещё и хвостовые
          // LOCATION3_ENTRANCE_VH/LOCATION3_SLIDE_COUNT/RESIDENCE_DWELL_VH
          // запасы (см. константы выше), иначе доли splitCrossfade/
          // scrolledPx съезжали бы относительно реального конца триггера
          // (`end`, тоже посчитанного через getPinDistance()).
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
            // дальше идут About/History/Pillars/Balance, последняя панель
            // трека (Location3Panel больше не в треке, см. useEffect выше).
            trackPx = afterCrossfadePx - squeezeBudget
            squeezeProgress = 1
          }

          const clampedTrackPx = gsap.utils.clamp(0, distance, trackPx)
          gsap.set(track, { x: -clampedTrackPx })
          setCol2(squeezeProgress)

          // Фаза 5: трек уже целиком докатился (trackPx достиг distance,
          // Balance полностью в кадре, неподвижна) — теперь Location3Panel
          // наезжает поверх неё.
          const afterTrackPx = Math.max(
            0,
            afterCrossfadePx - squeezeBudget - distance,
          )
          const overlayT = gsap.utils.clamp(
            0,
            1,
            afterTrackPx / location3EntranceBudget,
          )
          setLocation3Overlay(overlayT)

          // Фаза 6: наезд доигран (Location3Panel полностью на месте) —
          // теперь кроссфейд её собственных слайдов.
          const afterEntrancePx = Math.max(
            0,
            afterTrackPx - location3EntranceBudget,
          )
          const location3Local = gsap.utils.clamp(
            0,
            1,
            afterEntrancePx / location3CrossfadeBudget,
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
        location3.style.transform = ''
        location3.style.borderTopLeftRadius = ''
        location3.style.borderBottomLeftRadius = ''
        scrollToAboutImpl = null
        scrollToRetreatSlideImpl = null
        scrollToLocation3SlideImpl = null
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
          <Location2About ref={aboutRef} />
          <Location2History />
          <Location2Pillars />
          <Location2Balance onBookNow={onBookNow} />
        </div>

        <Location3Panel
          ref={location3Ref}
          activeIndex={location3ActiveIndex}
          onBookNow={onBookNow}
          setSlideRef={setLocation3SlideRef}
        />
      </section>
    </div>
  )
}
