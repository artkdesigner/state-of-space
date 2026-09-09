import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import MoveVisual from './MoveVisual'
import img0 from '../assets/beyond/00.webp'
import img1 from '../assets/beyond/01.webp'
import img2 from '../assets/beyond/02.webp'
import img3 from '../assets/beyond/03.webp'
import img4 from '../assets/beyond/04.webp'
import img5 from '../assets/beyond/05.webp'
import img6 from '../assets/beyond/06.webp'
import img7 from '../assets/beyond/07.webp'
import img8 from '../assets/beyond/08.webp'
import img9 from '../assets/beyond/09.webp'
import img10 from '../assets/beyond/10.webp'
import img11 from '../assets/beyond/11.webp'
import img12 from '../assets/beyond/12.webp'
import img13 from '../assets/beyond/13.webp'
import img14 from '../assets/beyond/14.webp'
import img15 from '../assets/beyond/15.webp'
import img16 from '../assets/beyond/16.webp'
import img17 from '../assets/beyond/17.webp'
import img18 from '../assets/beyond/18.webp'
import img19 from '../assets/beyond/19.webp'
import img20 from '../assets/beyond/20.webp'
import img21 from '../assets/beyond/21.webp'
import img22 from '../assets/beyond/22.webp'
import img23 from '../assets/beyond/23.webp'

const IMAGES = [
  img0,
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
  img14,
  img15,
  img16,
  img17,
  img18,
  img19,
  img20,
  img21,
  img22,
  img23,
]

/** Высота скролла, за которую кольцо делает один полный оборот. */
const PIN_HEIGHT_VH = 400
/** Заезд (заголовок из прозрачности + подъезд/усадка кольца до текущего
 * "покоя") занимает первые ENTRANCE_VH из общих PIN_HEIGHT_VH — дальше,
 * до конца пина, кольцо просто продолжает крутиться на уже финальном
 * месте (см. покадровую сцену «Анимация внутри Beyond (1..5)» в Figma,
 * узел 11144:893/999/1028/1057/970). Вращение (rotation, ниже) идёт
 * непрерывно на весь PIN_HEIGHT_VH и не зависит от ENTRANCE_VH — это
 * отдельный, уже существовавший до заезда слой анимации. */
const ENTRANCE_VH = 300

/** Кадры 1..5 из Figma-сцены, взятые как точки прогресса 0/0.25/0.5/0.75/1
 * внутри ENTRANCE_VH. Кадр 5 — уже закодированное состояние покоя
 * (translateY: 0) — совпадает с текущими статичными
 * `lg:top-30 lg:size-[118rem]` (120px/1888px в Figma, десктопный фрейм
 * 1920). Остальные — смещение ОТНОСИТЕЛЬНО этого покоя: translateY — в %
 * от СОБСТВЕННОЙ (финальной, брейкпоинт-специфичной) высоты
 * Beyond-carousel (не rem/px), поэтому один и тот же набор чисел
 * одинаково прикладывается на всех трёх брейкпоинтах без отдельных
 * mobile/tablet-фреймов — CSS `%` в `translate()` считается от
 * layout-размера элемента, который на каждом брейкпоинте уже свой
 * (23.125rem/59rem/118rem). Scale в кольцо больше не завязан на эти
 * кадры — см. SCALE_START/SCALE_END ниже: по правке пользователя рост
 * должен идти строго линейно, а не по ступеням Figma-сцены. */
const CAROUSEL_KEYFRAMES: { translateY: number }[] = [
  { translateY: 127.97 },
  { translateY: 113.67 },
  { translateY: 82.42 },
  { translateY: 36.86 },
  { translateY: 0 },
]
/** Точки кривой scale кольца — SCALE_START (кадр 1 сцены захода) и
 * SCALE_END (состояние покоя, конец захода). Третья точка (EXIT_SCALE_END)
 * добавляется ниже, после её объявления — см. RING_SCALE_KEYFRAMES и
 * комментарий там про то, почему все три точки нужно сэмплить ОДНОЙ
 * непрерывной кривой, а не двумя независимыми кусками. */
const SCALE_START = 2.4364
const SCALE_END = 1
/** Доля ENTRANCE_VH, за которую Beyond-title долистывает до 100% opacity
 * (на кадре 2 из 5 заголовок уже полностью виден, кольцо в это время
 * только начинает подниматься — см. сцену). */
const TITLE_FADE_WINDOW: [number, number] = [0, 0.25]

/** Переход «Beyond to Move» (см. Figma, узел 11153:2105..2448, 7 кадров) —
 * хвост собственного пина Beyond, длиной MOVE_VH, по просьбе пользователя
 * (400vh, подбирали на глаз). Три последовательные фазы:
 * 1) PHASE1 — кольцо продолжает крутиться и досаживается до размера кадра
 *    3, заголовок уходит в блюр до значения кадра 4;
 * 2) PHASE2 — из центра растёт круглая маска секции Move (квадрат со
 *    скруглением 50%, ширина/высота растут вместе в vw, поэтому остаются
 *    кругом на любом брейкпоинте без брейкпоинт-специфичных чисел), а
 *    заголовок/карточки внутри неё идут из scale/opacity 0 в 1;
 * 3) PHASE3 — после того как маска дошла до 100vw, высота досаживается со
 *    "100vw" до 100dvh (через CSS calc(), тоже без раннтайм-измерений), а
 *    скругление — с 50% до 0%, до финального полноэкранного прямоугольника.
 * Дальше идёт CARD_PIN_VH (см. ниже) — уже не рост маски, а смена карточек
 * внутри уже полностью выросшего Move. Раньше здесь была ОТДЕЛЬНАЯ секция
 * MoveSection.tsx, которая начинала сама пиниться сразу после того, как
 * Beyond отклеивалась — де-факто ДВЕ разные секции ("Move", выросшая из
 * маски, и следом настоящая MoveSection) визуально сшитые покадрово, но
 * по факту два отдельных DOM-узла (баг/дублирование, на которое пожаловался
 * пользователь). Теперь растущая маска — ЕДИНСТВЕННЫЙ Move: сама
 * card-хореография (см. CARD_COUNT/CARD_PIN_VH) перенесена сюда же, в тот
 * же trigger/onUpdate, что и рост маски, вместо отдельной секции/триггера
 * ниже по DOM. */
const MOVE_PHASE1_VH = 120
const MOVE_PHASE2_VH = 200
const MOVE_PHASE3_VH = 80
const MOVE_VH = MOVE_PHASE1_VH + MOVE_PHASE2_VH + MOVE_PHASE3_VH
/** Итоговый scale кольца на кадре 3 сцены (920/1888 от текущего покоя). */
const EXIT_SCALE_END = 920 / 1888
/** Смена 3 карточек Move-visual — тот же расчёт (`CARD_COUNT - 0.5`), что
 * раньше был в отдельной MoveSection.tsx, просто выраженный в "vh-числах"
 * (×100), как остальные константы этого файла, а не как прямой множитель
 * `window.innerHeight`. */
const CARD_COUNT = 3
const CARD_PIN_VH = (CARD_COUNT - 0.5) * 100
/** Итоговый блюр заголовка на кадре 4 сцены, 48.35px на Figma-фрейме 1920. */
const TITLE_BLUR_END_REM = 48.35 / 16

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const windowProgress = (p: number, [start, end]: [number, number]) =>
  clamp((p - start) / (end - start))

/** Кусочно-линейная интерполяция (со smoothstep внутри каждого отрезка)
 * между 5 keyframe-точками сцены — сохраняет неравномерность самой
 * Figma-анимации (например, между кадром 1 и 2 позиция ещё не такая
 * плавная, как хотелось бы, — а не сглаживает её одной кривой через все
 * 5 точек). Scale в это уже не входит, см. sampleScale. */
function sampleCarousel(progress: number) {
  const segments = CAROUSEL_KEYFRAMES.length - 1
  const scaled = clamp(progress) * segments
  const i = Math.min(segments - 1, Math.floor(scaled))
  const local = smoothstep(scaled - i)
  const a = CAROUSEL_KEYFRAMES[i]
  const b = CAROUSEL_KEYFRAMES[i + 1]
  return {
    translateY: a.translateY + (b.translateY - a.translateY) * local,
  }
}

/** Кривая scale кольца по АБСОЛЮТНОМУ vhScrolled, одной непрерывной
 * кусочно-smoothstep кривой через все 3 точки — SCALE_START (0vh) →
 * SCALE_END (ENTRANCE_VH, состояние покоя) → EXIT_SCALE_END (конец
 * MOVE_PHASE1_VH, кадр 3 перехода в Move). Раньше это были ДВА независимых
 * сэмпла (linear заезд + отдельный exit-множитель, стартующий только на
 * PIN_HEIGHT_VH), из-за чего между концом захода (ENTRANCE_VH=300vh) и
 * началом схлопывания (PIN_HEIGHT_VH=400vh) scale держался плоско — кольцо
 * визуально останавливалось, а потом резко возобновляло сжатие, хотя
 * вращение (rotation) всё это время шло непрерывно — асимметрия читалась
 * как "рывок"/"ступенька" (баг, на который пожаловался пользователь: "scale
 * меняется ступенчато"). Одна кривая через 3 точки убирает эту паузу —
 * сжатие начинается сразу же, как только заход долистан до состояния покоя,
 * без плоского участка между ними. */
const RING_SCALE_KEYFRAMES: { vh: number; scale: number }[] = [
  { vh: 0, scale: SCALE_START },
  { vh: ENTRANCE_VH, scale: SCALE_END },
  { vh: PIN_HEIGHT_VH + MOVE_PHASE1_VH, scale: EXIT_SCALE_END },
]

function sampleRingScale(vhScrolled: number) {
  const segments = RING_SCALE_KEYFRAMES.length - 1
  let i = 0
  while (
    i < segments - 1 &&
    vhScrolled > RING_SCALE_KEYFRAMES[i + 1].vh
  ) {
    i++
  }
  const a = RING_SCALE_KEYFRAMES[i]
  const b = RING_SCALE_KEYFRAMES[i + 1]
  const local = smoothstep(clamp((vhScrolled - a.vh) / (b.vh - a.vh)))
  return a.scale + (b.scale - a.scale) * local
}

/**
 * top/left/size — % от квадратного контейнера Beyond-carousel (это уже
 * ограничивающий квадрат повёрнутой картинки, взят напрямую из Figma).
 * rotate — угол поворота карточки, deg. tint — тёмная плашка поверх фото.
 */
const ITEMS: {
  top: number
  left: number
  size: number
  rotate: number
  image: number
  tint?: boolean
}[] = [
  { top: 26.08, left: 2.38, size: 12.28, rotate: -66.81, image: 1 },
  { top: 61.63, left: 85.32, size: 12.27, rotate: -66.81, image: 2 },
  { top: 15.53, left: 7.97, size: 13.13, rotate: -51.81, image: 3 },
  { top: 71.33, left: 78.88, size: 13.13, rotate: -51.81, image: 4 },
  { top: 7.32, left: 16.42, size: 13.09, rotate: -36.81, image: 5 },
  { top: 79.57, left: 70.47, size: 13.09, rotate: -36.81, image: 6 },
  { top: 2.03, left: 27.16, size: 12.15, rotate: -21.81, image: 7 },
  { top: 85.8, left: 60.67, size: 12.15, rotate: -21.81, image: 8 },
  { top: 0, left: 39.45, size: 10.39, rotate: -6.81, image: 9 },
  { top: 89.59, left: 50.14, size: 10.39, rotate: -6.81, image: 10 },
  { top: 0.05, left: 51.13, size: 10.59, rotate: 8.19, image: 11 },
  { top: 89.35, left: 38.26, size: 10.59, rotate: 8.19, image: 12 },
  { top: 2.39, left: 61.62, size: 12.28, rotate: 23.19, image: 13 },
  { top: 85.32, left: 26.08, size: 12.28, rotate: 23.19, image: 14 },
  { top: 7.97, left: 71.32, size: 13.13, rotate: 38.19, image: 14 },
  { top: 78.88, left: 15.53, size: 13.13, rotate: 38.19, image: 15 },
  { top: 16.42, left: 79.57, size: 13.09, rotate: 53.19, image: 16 },
  { top: 70.47, left: 7.33, size: 13.08, rotate: 53.19, image: 17 },
  { top: 27.16, left: 85.8, size: 12.16, rotate: 68.19, image: 18, tint: true },
  { top: 60.67, left: 2.03, size: 12.15, rotate: 68.19, image: 19 },
  {
    top: 39.45,
    left: 89.59,
    size: 10.39,
    rotate: 83.19,
    image: 20,
    tint: true,
  },
  { top: 50.14, left: 0, size: 10.39, rotate: 83.19, image: 21 },
  { top: 51.13, left: 89.35, size: 10.59, rotate: 98.19, image: 22 },
  { top: 38.27, left: 0.05, size: 10.58, rotate: 98.19, image: 23 },
]

/** Ребро квадратной картинки в % от её же повёрнутого ограничивающего квадрата. */
function innerEdgePercent(rotateDeg: number) {
  const rad = (rotateDeg * Math.PI) / 180
  return 100 / (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)))
}

export default function BeyondSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const entranceRef = useRef<HTMLDivElement>(null)
  const moveMaskRef = useRef<HTMLDivElement>(null)
  const moveContentRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  /* Кольцо крутится на TOTAL_SCRUB_VH = PIN_HEIGHT_VH + MOVE_VH + CARD_PIN_VH
   * вьюпортов, пока Beyond приклеена вверху (`position: sticky; top: 0`
   * внутри Beyond-pin-wrap — без margin-top, тот же случай, что
   * Location3Section.tsx). Первые ENTRANCE_VH из PIN_HEIGHT_VH — заезд:
   * Beyond-title из прозрачности + Beyond-carousel подъезжает/усаживается
   * от кадра 1 до уже закодированного кадра 5 (см.
   * CAROUSEL_KEYFRAMES/TITLE_FADE_WINDOW выше). Вращение (rotation) идёт
   * НЕПРЕРЫВНО на весь TOTAL_SCRUB_VH, не завися ни от заезда, ни от
   * хвоста — угловая скорость не меняется на границе PIN_HEIGHT_VH/MOVE_VH,
   * кольцо просто продолжает крутиться (см. rawVhScrolled ниже). Хвост
   * MOVE_VH — переход «Beyond to Move», см. константы выше. Хвост
   * CARD_PIN_VH сразу следом — уже не рост, а смена карточек Move-visual
   * (см. CARD_COUNT/CARD_PIN_VH и комментарий у них). */
  const TOTAL_SCRUB_VH = PIN_HEIGHT_VH + MOVE_VH + CARD_PIN_VH

  useEffect(() => {
    const wrap = wrapRef.current
    const title = titleRef.current
    const carousel = carouselRef.current
    const entrance = entranceRef.current
    const mask = moveMaskRef.current
    const content = moveContentRef.current
    if (!wrap || !title || !carousel || !entrance || !mask || !content) return

    // Beyond-carousel стоит статично через top-30 (Desktop) вместо
    // top-1/2 -translate-y-1/2 (Mobile/Tablet, уже по центру) — см. её
    // className ниже. Чтобы кольцо оказалось по центру секции ровно к
    // началу роста маски Move (по просьбе пользователя), меряем реальный
    // зазор между центром статичного бокса (не зависит от JS-transform на
    // entrance, см. getBoundingClientRect ниже — transform ребёнка не
    // трогает layout-геометрию родителя) и центром вьюпорта, и добавляем
    // этот зазор как ещё один additive translateY (в px, поверх основного
    // %-based) на PHASE1 (см. centerOffsetPx в onUpdate). На Mobile/Tablet
    // зазор и так ~0 (кольцо уже по центру), поэтому JS не нужно ветвить
    // по брейкпоинту отдельно.
    const measureCenterOffset = () => {
      const rect = carousel.getBoundingClientRect()
      const carouselCenterY = rect.top + rect.height / 2
      return window.innerHeight / 2 - carouselCenterY
    }
    let centerOffsetPx = measureCenterOffset()
    const onResize = () => {
      centerOffsetPx = measureCenterOffset()
    }
    window.addEventListener('resize', onResize)

    if (reduceMotion()) {
      title.style.opacity = '1'
      title.style.filter = ''
      entrance.style.transform = ''
      mask.style.width = '100vw'
      mask.style.height = '100dvh'
      mask.style.borderRadius = '0'
      content.style.opacity = '1'
      content.style.transform = 'scale(1)'
    } else {
      // Синхронно, до первого onUpdate — тот же приём, что в
      // Location1Section.tsx, иначе на reload кадр рисуется в состоянии
      // покоя и заметно моргает при первом скролле.
      title.style.opacity = '0'
      const start = sampleCarousel(0)
      entrance.style.transform = `translateY(${start.translateY}%) scale(${sampleRingScale(0)})`
      mask.style.width = '0px'
      mask.style.height = '0px'
      mask.style.borderRadius = '50%'
      content.style.opacity = '0'
      content.style.transform = 'scale(0)'
    }

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (TOTAL_SCRUB_VH / 100),
      scrub: true,
      onUpdate: (self) => {
        const vhScrolled = self.progress * TOTAL_SCRUB_VH
        setRotation((vhScrolled / PIN_HEIGHT_VH) * 360)

        if (reduceMotion()) return

        const entranceProgress = clamp(vhScrolled / ENTRANCE_VH)
        title.style.opacity = String(
          windowProgress(entranceProgress, TITLE_FADE_WINDOW),
        )

        // Хвост «Beyond to Move» начинается только после PIN_HEIGHT_VH —
        // до этого момента vhInMove отрицательный, все три clamp() ниже
        // держат кольцо/маску в состоянии покоя.
        const vhInMove = vhScrolled - PIN_HEIGHT_VH

        // Фаза 1: кольцо досаживается до scale кадра 3 (см.
        // sampleRingScale — одна непрерывная кривая, без паузы на границе
        // ENTRANCE_VH/PIN_HEIGHT_VH), заголовок — в блюр до значения кадра
        // 4, и кольцо довдвигается к центру секции (centerOffsetPx, см.
        // измерение выше) — по просьбе пользователя, к началу роста маски
        // Move кольцо должно уже стоять по центру, а не в своей статичной
        // "top-30" точке покоя.
        const shrinkT = clamp(vhInMove / MOVE_PHASE1_VH)
        const shrinkEase = smoothstep(shrinkT)
        const { translateY } = sampleCarousel(entranceProgress)
        const scale = sampleRingScale(vhScrolled)
        entrance.style.transform = `translateY(calc(${translateY}% + ${centerOffsetPx * shrinkEase}px)) scale(${scale})`
        title.style.filter = `blur(${TITLE_BLUR_END_REM * shrinkEase}rem)`

        // Фаза 2: маска растёт из центра квадратом (ширина=высота в vw —
        // остаётся кругом на любом брейкпоинте), элементы внутри идут из
        // scale/opacity 0 в 1.
        const maskT = clamp((vhInMove - MOVE_PHASE1_VH) / MOVE_PHASE2_VH)
        // Лёгкий ease-in (t²) — по кадрам 4/5/6 сцены рост ускоряется, а не
        // идёт равномерно (см. разбор в комментарии к MOVE_PHASE2_VH).
        const growPct = maskT * maskT * 100
        mask.style.width = `${growPct}vw`
        mask.style.height = `${growPct}vw`
        const contentT = smoothstep(maskT)
        content.style.opacity = String(contentT)
        content.style.transform = `scale(${contentT})`

        // Фаза 3: маска уже 100vw — досаживает высоту до 100dvh и скругление
        // до 0, через CSS calc() между vw/dvh, без раннтайм-измерений.
        const radiusT = smoothstep(
          clamp((vhInMove - MOVE_PHASE1_VH - MOVE_PHASE2_VH) / MOVE_PHASE3_VH),
        )
        if (maskT >= 1) {
          mask.style.width = '100vw'
          mask.style.height = `calc(100vw + (100dvh - 100vw) * ${radiusT})`
          mask.style.borderRadius = `${50 * (1 - radiusT)}%`
        }

        // Фаза 4: маска уже полностью выросла (см. фазы 1-3 выше) — смена
        // карточек Move-visual, тот же расчёт, что раньше был в отдельной
        // MoveSection.tsx (см. CARD_PIN_VH/CARD_COUNT).
        const vhInCards = vhInMove - MOVE_VH
        const cardsProgress = clamp(vhInCards / CARD_PIN_VH)
        const cardIndex = Math.min(
          CARD_COUNT - 1,
          Math.floor(cardsProgress * CARD_COUNT),
        )
        setActiveIndex((prev) => (prev === cardIndex ? prev : cardIndex))
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      trigger.kill()
      title.style.opacity = ''
      title.style.filter = ''
      entrance.style.transform = ''
      mask.style.width = ''
      mask.style.height = ''
      mask.style.borderRadius = ''
      content.style.opacity = ''
      content.style.transform = ''
    }
  }, [TOTAL_SCRUB_VH])

  return (
    <div
      ref={wrapRef}
      className="Beyond-pin-wrap relative"
      style={{ height: `${100 + PIN_HEIGHT_VH + MOVE_VH + CARD_PIN_VH}vh` }}
    >
      <section
        id="beyond"
        className="Beyond sticky top-0 flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-blue"
      >
        <p
          ref={titleRef}
          className="Beyond-title relative z-1 text-center font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-light md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]"
        >
          Beyond the
          <br />
          Usual Life
        </p>

        <div
          ref={carouselRef}
          className="Beyond-carousel absolute left-1/2 top-1/2 size-[23.125rem] -translate-x-1/2 -translate-y-1/2 md:size-[59rem] lg:top-30 lg:size-[118rem] lg:translate-y-0"
        >
          <div
            ref={entranceRef}
            className="Beyond-carousel-entrance absolute inset-0"
          >
            <div
              className="Beyond-carousel-spin absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {ITEMS.map((item, i) => {
                const edge = innerEdgePercent(item.rotate)
                return (
                  <div
                    key={i}
                    className="Beyond-carousel-img absolute"
                    style={{
                      top: `${item.top}%`,
                      left: `${item.left}%`,
                      width: `${item.size}%`,
                      height: `${item.size}%`,
                    }}
                  >
                    <div
                      className="absolute overflow-hidden rounded-[0.3125rem] md:rounded-[0.9375rem] lg:rounded-[1.8388rem]"
                      style={{
                        top: '50%',
                        left: '50%',
                        width: `${edge}%`,
                        height: `${edge}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                      }}
                    >
                      <img
                        src={IMAGES[item.image]}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                      />
                      {item.tint && (
                        <div
                          className="absolute inset-0 bg-dark/30"
                          aria-hidden
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Растущая маска — это и есть Move, а не клон-заглушка перед
         * настоящей секцией: раньше здесь была ОТДЕЛЬНАЯ MoveSection.tsx,
         * которая подхватывала обычным document flow сразу после того, как
         * этот хвост доигран — де-факто два разных DOM-узла одной и той же
         * секции, визуально сшитых покадрово (дублирование, на которое
         * пожаловался пользователь). Теперь MoveSection.tsx удалена,
         * card-хореография (activeIndex) считается прямо здесь, в фазе 4
         * onUpdate (см. CARD_PIN_VH выше) — эта маска остаётся на экране и
         * после того, как выросла, вплоть до конца всего Beyond-pin-wrap. */}
        <div
          ref={moveMaskRef}
          id="move"
          className="Beyond-move-mask absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-light"
          style={{ width: 0, height: 0, borderRadius: '50%' }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: 'calc(50% - 50vw)',
              top: 'calc(50% - 50dvh)',
              width: '100vw',
              height: '100dvh',
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center px-2.5">
              <MoveVisual
                activeIndex={activeIndex}
                contentRef={(el) => {
                  moveContentRef.current = el
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
