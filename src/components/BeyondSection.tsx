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
/** Линейный рост scale кольца на заезде: от SCALE_START (кадр 1 сцены) до
 * SCALE_END (состояние покоя) — без ступеней/smoothstep по кадрам, просто
 * прямая пропорция entrance-прогрессу. */
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
 * Дальше, вплоть до конца PHASE3, Beyond всё ещё приклеена — как только
 * скролл проходит этот хвост, Beyond отклеивается и обычным document flow
 * сразу открывается настоящая MoveSection.tsx, которая к этому моменту
 * выглядит идентично последнему кадру маски (тот же MoveVisual). */
const MOVE_PHASE1_VH = 120
const MOVE_PHASE2_VH = 200
const MOVE_PHASE3_VH = 80
const MOVE_VH = MOVE_PHASE1_VH + MOVE_PHASE2_VH + MOVE_PHASE3_VH
/** Итоговый scale кольца на кадре 3 сцены (920/1888 от текущего покоя). */
const EXIT_SCALE_END = 920 / 1888
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

/** Строго линейный рост scale по entrance-прогрессу, без smoothstep и
 * без промежуточных кадров — от SCALE_START до SCALE_END напрямую. */
function sampleScale(progress: number) {
  return SCALE_START + (SCALE_END - SCALE_START) * clamp(progress)
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
  const entranceRef = useRef<HTMLDivElement>(null)
  const moveMaskRef = useRef<HTMLDivElement>(null)
  const moveContentRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)

  /* Кольцо крутится на TOTAL_SCRUB_VH = PIN_HEIGHT_VH + MOVE_VH вьюпортов,
   * пока Beyond приклеена вверху (`position: sticky; top: 0` внутри
   * Beyond-pin-wrap — без margin-top, тот же случай, что
   * Location3Section.tsx). Первые ENTRANCE_VH из PIN_HEIGHT_VH — заезд:
   * Beyond-title из прозрачности + Beyond-carousel подъезжает/усаживается
   * от кадра 1 до уже закодированного кадра 5 (см.
   * CAROUSEL_KEYFRAMES/TITLE_FADE_WINDOW выше). Вращение (rotation) идёт
   * НЕПРЕРЫВНО на весь TOTAL_SCRUB_VH, не завися ни от заезда, ни от
   * хвоста — угловая скорость не меняется на границе PIN_HEIGHT_VH/MOVE_VH,
   * кольцо просто продолжает крутиться (см. rawVhScrolled ниже). Хвост
   * MOVE_VH — переход «Beyond to Move», см. константы выше. */
  const TOTAL_SCRUB_VH = PIN_HEIGHT_VH + MOVE_VH

  useEffect(() => {
    const wrap = wrapRef.current
    const title = titleRef.current
    const entrance = entranceRef.current
    const mask = moveMaskRef.current
    const content = moveContentRef.current
    if (!wrap || !title || !entrance || !mask || !content) return

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
      entrance.style.transform = `translateY(${start.translateY}%) scale(${sampleScale(0)})`
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

        // Фаза 1: кольцо досаживается до scale кадра 3, заголовок — в блюр
        // до значения кадра 4.
        const shrinkT = clamp(vhInMove / MOVE_PHASE1_VH)
        const { translateY } = sampleCarousel(entranceProgress)
        const scale =
          sampleScale(entranceProgress) *
          (1 + (EXIT_SCALE_END - 1) * smoothstep(shrinkT))
        entrance.style.transform = `translateY(${translateY}%) scale(${scale})`
        title.style.filter = `blur(${TITLE_BLUR_END_REM * smoothstep(shrinkT)}rem)`

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
      },
    })

    return () => {
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
      style={{ height: `${100 + PIN_HEIGHT_VH + MOVE_VH}vh` }}
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

        <div className="Beyond-carousel absolute left-1/2 top-1/2 size-[23.125rem] -translate-x-1/2 -translate-y-1/2 md:size-[59rem] lg:top-30 lg:size-[118rem] lg:translate-y-0">
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

        {/* Растущая маска секции Move (переход «Beyond to Move», см.
         * MOVE_PHASE1_VH/2/3_VH выше) — клон MoveVisual, не настоящая
         * MoveSection.tsx: та подхватывает обычным document flow сразу
         * после того, как этот хвост доигран, и к тому моменту выглядит
         * идентично последнему кадру этой маски. aria-hidden — доступный
         * инстанс контента только один, в самой MoveSection.tsx. */}
        <div
          ref={moveMaskRef}
          aria-hidden
          className="Beyond-move-mask pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-light"
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
                activeIndex={0}
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
