import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import { CLIFF_PIN_VH, location1PinEnd } from '../lib/scrollChain'
import cliff1 from '../assets/cliff-1.webp'
import cliff2 from '../assets/cliff-2.webp'
import cliff3 from '../assets/cliff-3.webp'
import cliff4 from '../assets/cliff-4.webp'
import cliff5 from '../assets/cliff-5.webp'

const IMAGE_RADIUS =
  'overflow-hidden rounded-[0.5625rem] md:rounded-[0.9375rem] lg:rounded-[1.875rem]'

/** Скролл-дистанция наезда Location1 (Location1Section подтягивает Cliff
 * заранее, см. комментарий там), в высотах вьюпорта. */
const LOCATION1_RECEDE_VH = 2
/** Общая дистанция пина (LOCATION1_RECEDE_VH + REVEAL_VH внутренней
 * хореографии Cliff) — источник истины в scrollChain.ts (следующий шаг
 * цепочки, AboveSection, берёт от неё свою абсолютную стартовую позицию). */
const TOTAL_VH = CLIFF_PIN_VH
/** Граница между двумя фазами общего прогресса пина, 0..1. */
const PHASE_BOUNDARY = LOCATION1_RECEDE_VH / TOTAL_VH

/** Доля фазы reveal, за которую Cliff-title успевает уйти за кадр
 * (см. покадровую сцену в Figma: -150 к кадру 4 из 5, т.е. к 75%). */
const TITLE_EXIT_FRACTION = 0.75
/** На сколько высот вьюпорта Cliff-title уезжает вверх — 623/1080 по
 * Figma-кадру (1920×1080), где 623 = 473 - (-150). */
const TITLE_EXIT_VH = (623 / 1080) * 100
/** Cliff-sub-title/description въезжают с боков во второй половине
 * фазы reveal (в кадрах 1-3 они ещё за кадром, см. Figma). */
const TEXT_ENTER_START = 0.5
/** На сколько ширин вьюпорта текстовые блоки въезжают с боков —
 * 660/1920 по Figma-кадру (Cliff-sub-title: x -640 → 20). */
const TEXT_ENTER_VW = (660 / 1920) * 100

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function CliffSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subTitleRef = useRef<HTMLDivElement>(null)
  const descriptionWrapRef = useRef<HTMLDivElement>(null)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([])

  const setImgRef = (index: number) => (el: HTMLDivElement | null) => {
    imgRefs.current[index] = el
  }

  /* Скролл-хореография Cliff — один общий pin на две фазы (см. покадровые
   * сцены в Figma):
   * 1) 0 → PHASE_BOUNDARY — наезд Location1 (узлы "Location1 to Cliff
   *    1..5"): Location1 уезжает вверх через margin-top (перенесено сюда
   *    из Location1Section.tsx, т.к. пин стоит на Cliff).
   * 2) PHASE_BOUNDARY → 1 — внутренняя хореография Cliff (узлы
   *    "Cliff 1..5"): Cliff-title уходит вверх и пропадает за кадром;
   *    Cliff-sub-title/-description въезжают с боков (изначально за
   *    кадром слева/справа); 5 фото из Cliff-img-wrap сходятся в стопку
   *    точно в центре обёртки (в Figma центры всех 5 фото в кадре 5
   *    совпадают с центром Cliff-img-wrap с точностью до пикселя).
   * Один тригger вместо двух отдельных пинов на одном элементе — GSAP не
   * умеет чисто стекать два независимых pin:true на одном и том же узле.
   *
   * `start` — точная позиция скролла (конец пина Location1-слайдера, см.
   * src/lib/scrollChain.ts), а не 'top top': при 'top top' и быстром
   * скролле (флик) секция телепортируется на нужную позицию вместо
   * плавного пина — см. подробный комментарий в IntroSection.tsx. */
  useEffect(() => {
    const section = sectionRef.current
    const location1 = document.getElementById('location1')
    const title = titleRef.current
    const subTitle = subTitleRef.current
    const descriptionWrap = descriptionWrapRef.current
    const images = imgRefs.current
    if (!section || !location1 || !title || !subTitle || !descriptionWrap) {
      return
    }
    if (reduceMotion()) return

    // Смещение центра каждого фото от центра Cliff-img-wrap — считаем
    // один раз по исходной (ещё не тронутой transform'ом) вёрстке, чтобы
    // на 100% прогресса каждое фото легло ровно в центр обёртки.
    const measure = () =>
      images.map((img) => {
        const wrapper = img?.parentElement
        // Реальное визуальное положение фото — на вложенном div'е (там
        // же живёт `-translate-y-1/2` и т.п. для его собственного
        // Tailwind-центрирования); сам `img` (ref) — только позиционер
        // без транформа, чтобы наш JS-transform ничего не перекрывал.
        const inner = img?.firstElementChild as HTMLElement | null
        if (!img || !wrapper || !inner) return { dx: 0, dy: 0 }
        const prevTransform = img.style.transform
        img.style.transform = 'none'
        const wrapRect = wrapper.getBoundingClientRect()
        const imgRect = inner.getBoundingClientRect()
        img.style.transform = prevTransform
        return {
          dx:
            wrapRect.left +
            wrapRect.width / 2 -
            (imgRect.left + imgRect.width / 2),
          dy:
            wrapRect.top +
            wrapRect.height / 2 -
            (imgRect.top + imgRect.height / 2),
        }
      })

    let offsets = measure()
    const onResize = () => {
      offsets = measure()
    }
    window.addEventListener('resize', onResize)

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: location1PinEnd,
      end: () => location1PinEnd() + window.innerHeight * TOTAL_VH,
      pin: true,
      scrub: true,
      /* Раньше здесь вызывался ScrollTrigger.refresh() в onLeave (и
       * симметрично в onEnterBack) — начало следующего пина берётся по
       * чистой формуле (см. scrollChain.ts), пересчитывать тут нечего.
       * refresh() при смене размеров pin-спейсеров может САМ подвинуть
       * scroll(), чтобы сохранить прогресс активного пина — при быстром
       * скролле назад-вперёд прямо на границе Hero/Intro это и давало
       * скачок-телепорт (см. HeroSection.tsx и видео в переписке с
       * пользователем 2026-09-08). */
      onUpdate: (self) => {
        const p = self.progress

        // Скругление растёт в обратную сторону тому, как оно распрямлялось
        // при наезде на Intro (см. IntroSection.tsx) — только теперь на
        // НИЖНИХ углах: секция уезжает вверх, верхний край сразу уходит
        // за кадр, а нижний остаётся видимым дольше всех и закругляется
        // по мере того как Location1 исчезает.
        const recede = easeOutCubic(clamp(p / PHASE_BOUNDARY))
        location1.style.marginTop = `${-recede * 100}vh`
        const radius = recede * 45
        location1.style.borderBottomLeftRadius = `${radius}vw`
        location1.style.borderBottomRightRadius = `${radius}vw`

        const reveal = clamp((p - PHASE_BOUNDARY) / (1 - PHASE_BOUNDARY))

        const titleEase = easeOutCubic(clamp(reveal / TITLE_EXIT_FRACTION))
        title.style.transform = `translateY(${-titleEase * TITLE_EXIT_VH}vh)`

        const textEase = easeOutCubic(
          clamp((reveal - TEXT_ENTER_START) / (1 - TEXT_ENTER_START)),
        )
        subTitle.style.transform = `translateX(${-(1 - textEase) * TEXT_ENTER_VW}vw)`
        descriptionWrap.style.transform = `translateX(${(1 - textEase) * TEXT_ENTER_VW}vw)`

        const imagesEase = easeOutCubic(reveal)
        images.forEach((img, i) => {
          if (!img) return
          const { dx, dy } = offsets[i]
          img.style.transform = `translate(${dx * imagesEase}px, ${dy * imagesEase}px)`
        })
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      trigger.kill()
      location1.style.marginTop = ''
      location1.style.borderBottomLeftRadius = ''
      location1.style.borderBottomRightRadius = ''
      title.style.transform = ''
      subTitle.style.transform = ''
      descriptionWrap.style.transform = ''
      images.forEach((img) => {
        if (img) img.style.transform = ''
      })
    }
  }, [])

  return (
    <section
      id="cliff"
      ref={sectionRef}
      className="Cliff relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-light px-2.5 py-30 lg:px-5"
    >
      <h2
        ref={titleRef}
        className="Cliff-title pointer-events-none absolute inset-0 z-1 flex items-center justify-center whitespace-nowrap font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]"
      >
        The Cliff Villa
      </h2>

      <div className="Cliff-content-wrap relative z-2 flex w-full flex-col items-center lg:flex-row lg:items-center lg:justify-center lg:gap-5">
        <div
          ref={subTitleRef}
          className="Cliff-sub-title w-full md:w-72.5 lg:w-[38.75rem]"
        >
          <p className="translate-y-[1.6406rem] text-center font-manrope text-[1.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-dark md:translate-y-[1.7598rem] lg:translate-y-0 lg:text-left lg:text-[2.875rem]">
            Not an Escape,
            <br />
            but a Return <br className="hidden lg:block" />
            to Clear Attention
          </p>
        </div>

        <div className="Cliff-img-wrap relative mt-[23rem] mb-[26rem] h-35.5 w-42.5 shrink-0 md:mt-[26rem] md:mb-[32rem] md:h-50 md:w-60 lg:m-0 lg:h-125 lg:w-150">
          <div
            ref={setImgRef(0)}
            className="Cliff-img-1 absolute left-[-8.0625rem] top-[calc(50%-21.78125rem)] md:left-[-17.625rem] md:top-[calc(50%-24.75rem)] lg:left-[-45.1875rem] lg:top-[calc(50%-20.625rem)]"
          >
            <div
              className={`-translate-y-1/2 h-[7.1875rem] w-[11.375rem] md:h-[11.875rem] md:w-[18.75rem] lg:h-[23.75rem] lg:w-[37.5rem] ${IMAGE_RADIUS}`}
            >
              <img
                src={cliff1}
                alt="Living room silhouette at sunset with ocean view"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div
            ref={setImgRef(1)}
            className="Cliff-img-2 absolute right-[-6.1875rem] top-[calc(50%-16.3125rem)] md:right-auto md:left-[calc(50%+18.9375rem)] md:top-[calc(50%-17.9375rem)] lg:left-[calc(50%+37.5rem)] lg:top-[calc(50%-30.625rem)]"
          >
            <div
              className={`-translate-y-1/2 h-[9.375rem] w-[7.5rem] md:-translate-x-1/2 md:h-[15.625rem] md:w-[12.5rem] lg:-translate-x-1/2 lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
            >
              <img
                src={cliff2}
                alt="Living room window framing ocean waves and cliffs"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div
            ref={setImgRef(2)}
            className="Cliff-img-3 absolute left-[-8.3125rem] top-[calc(50%+4.6875rem)] md:left-[-20.1875rem] md:top-[calc(50%+6.125rem)] lg:left-[-53.75rem] lg:top-[calc(50%+15rem)]"
          >
            <div
              className={`-translate-y-1/2 h-[8.25rem] w-[6.375rem] md:h-[13.75rem] md:w-[10.625rem] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
            >
              <img
                src={cliff3}
                alt="Terrace daybed overlooking the cliffside at dusk"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div
            ref={setImgRef(3)}
            className="Cliff-img-4 absolute left-[11.875rem] top-[calc(50%+10.78125rem)] md:left-[23.3125rem] md:top-[calc(50%+14.1875rem)] lg:left-[56.25rem] lg:top-[calc(50%+18.75rem)]"
          >
            <div
              className={`-translate-y-1/2 h-[8.0625rem] w-[6.25rem] md:h-[13.75rem] md:w-[10.625rem] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
            >
              <img
                src={cliff4}
                alt="Ocean waves seen through the living room sliding doors"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div
            ref={setImgRef(4)}
            className="Cliff-img-5 absolute left-[calc(50%-3rem)] top-[calc(50%+23.9375rem)] md:left-[calc(50%-3.875rem)] md:top-[calc(50%+28.3125rem)] lg:left-[calc(50%-8.75rem)] lg:top-[calc(50%+30.625rem)]"
          >
            <div
              className={`-translate-x-1/2 -translate-y-1/2 h-[9.375rem] w-[7.5rem] md:h-[15.625rem] md:w-[12.5rem] lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
            >
              <img
                src={cliff5}
                alt="Aerial view of the villa and pool above the coastline at sunset"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div
          ref={descriptionWrapRef}
          className="Cliff-description-wrap w-full lg:w-[38.75rem]"
        >
          <div className="flex -translate-y-[0.9814rem] md:-translate-y-[2.2373rem] lg:translate-y-0 lg:justify-end">
            <p className="Cliff-description w-full text-center font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] text-dark lg:w-[23.125rem] lg:text-left lg:text-[1.125rem]">
              This space is not about retreating from life, but about removing
              what distracts you from it. Here, attention becomes stable.
              Thoughts slow down.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
