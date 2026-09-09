import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import residenceCircleSide from '../assets/residence-circle-side.svg'
import residenceCircleCenter from '../assets/residence-circle-center.svg'

/** Длительность собственной (pin) хореографии Residence-bottom на Desktop,
 * в высотах вьюпорта — см. useEffect ниже. Три последовательные фазы без
 * нахлёста (sub → title-fill → column), поэтому общий бюджет достаточно
 * щедрый: title-fill несёт ~21 слово и должен успеть прочитаться, а не
 * промелькнуть. */
const REVEAL_VH = 3
/** Доли REVEAL_VH под каждую фазу — строго последовательно (по просьбе:
 * "после того как текст заполнился" начинается column), без нахлёста. */
const SUB_WINDOW: [number, number] = [0, 0.15]
const TITLE_WINDOW: [number, number] = [0.15, 0.85]
const COLUMN_WINDOW: [number, number] = [0.85, 1]
/** Базовая (незалитая) яркость слова и её "долив" при 100% локального
 * прогресса — 0.3 → 1, как попросили. */
const WORD_BASE_OPACITY = 0.3

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const windowProgress = (p: number, [start, end]: [number, number]) =>
  clamp((p - start) / (end - start))
/** Окно конкретного слова внутри локального прогресса title-фазы — чуть
 * шире равной доли (×1.5), чтобы соседние слова слегка перетекали одно в
 * другое, а не заливались резким по-слову "щёлчком". */
const wordWindow = (i: number, total: number): [number, number] => {
  const step = 1 / total
  return [i * step, Math.min(1, (i + 1.5) * step)]
}

/**
 * Разбивает предложение на слова-`span`ы общего класса
 * `Residence-bottom-word` (незалитая яркость `WORD_BASE_OPACITY` изначально)
 * — по ним потом queryselect'ится и построчно "доливается" заголовок, что
 * на Desktop (см. useEffect), что на Tablet/Mobile. Пробелы между словами —
 * обычные текстовые узлы, не внутри span'ов, чтобы перенос строк вёл себя
 * как у обычного текста. */
function SplitWords({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  text.split(' ').forEach((word, i) => {
    if (i > 0) nodes.push(' ')
    nodes.push(
      <span
        key={i}
        className="Residence-bottom-word"
        style={{ opacity: WORD_BASE_OPACITY }}
      >
        {word}
      </span>,
    )
  })
  return <>{nodes}</>
}

const TOP_CARDS = [
  {
    title: 'Private Water Residence',
    text: 'A self-contained world on the ocean, free from land and external rhythms. Life unfolds here on its own terms.',
  },
  {
    title: 'Space Without Interruption',
    text: 'Open horizon in every direction. No visual barriers — only the shifting dialogue between interior, water, and sky.',
  },
  {
    title: 'Life Without Schedules',
    text: 'Life follows the sea: light, movement, conditions. Not routines, but shifts between action, rest, and awareness.',
  },
]

const BOTTOM_CARDS = [
  {
    title: 'Integrated Living System',
    text: 'The Water Residence integrates private suites, open decks, and shared living spaces into one seamless system. Every element minimizes friction and visual noise, enabling uninterrupted use day and night.',
  },
  {
    title: 'Autonomy',
    text: 'Here, the environment adapts to the occupant — not the other way around. The result is a living experience defined by autonomy, continuity, and a direct relationship with water and horizon.',
  },
]

export default function ResidenceSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLHeadingElement>(null)
  const bottomWrapRef = useRef<HTMLDivElement>(null)
  const bottomPinRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  /* Residence-top-pin — `position: sticky; top: 0` внутри
   * Residence-top-wrap, чья высота, как и у Location2Section.tsx, считается
   * императивно из реальной ширины трека (getDistance), а не статическим
   * vh — задаём её в updateHeight и пересчитываем на resize. */
  useEffect(() => {
    const wrap = wrapRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!wrap || !pin || !track) return

    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth)
    const getPinDistance = () => getDistance() * 2

    const updateHeight = () => {
      wrap.style.height = `${pin.offsetHeight + getPinDistance()}px`
    }
    updateHeight()

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + getPinDistance(),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -getDistance() * self.progress })
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
  }, [])

  /* Residence-bottom: sub → title (пословный fill) → column, строго по
   * очереди (см. константы REVEAL_VH/*_WINDOW выше). На Desktop это
   * настоящий scroll-scrub pin — `position: sticky; top: 0` внутри
   * Residence-bottom-wrap высотой (1 + REVEAL_VH) вьюпортов, без
   * margin-top (никто не наезжает на Residence-bottom сверху — тот же
   * случай "голого" pin'а без cover-приёма, что у AdvantagesSection.tsx/
   * Location3Section.tsx, `start: 'top top'` работает буквально).
   *
   * На Tablet/Mobile содержимое Residence-bottom выше своего вьюпорта
   * (проверено: на 390×844 оно ~964px) — жёсткий pin на h-dvh обрезал бы
   * нижнюю карточку, а сжимать вёрстку без сверки с Figma-фреймом рискованно
   * (см. фидбек про "не гадать по несверенным фреймам"). Поэтому на этих
   * брейкпоинтах пина вообще нет: секция обычный поток, а та же
   * трёхфазная последовательность идёт через IntersectionObserver +
   * CSS-transition разово при попадании в вьюпорт — не привязана к
   * скроллу непрерывно, просто "по очереди появляется".
   *
   * `gsap.matchMedia()` — тот же приём, что в Location2Section.tsx для
   * горизонтального скролла на md+: активна только ОДНА из веток
   * одновременно, GSAP сам вызывает cleanup предыдущей ветки при
   * пересечении брейкпоинта (ресайз/поворот экрана), никакого ручного
   * отслеживания текущей ширины не нужно. */
  useEffect(() => {
    const wrap = bottomWrapRef.current
    const pin = bottomPinRef.current
    const sub = subRef.current
    const titleP = titleRef.current
    const column = columnRef.current
    if (!wrap || !pin || !sub || !titleP || !column) return

    const words = Array.from(
      titleP.querySelectorAll<HTMLElement>('.Residence-bottom-word'),
    )

    const mm = gsap.matchMedia()

    mm.add('(min-width: 62rem)', () => {
      // Синхронно, до первого onUpdate — тот же приём, что в
      // Location1Section.tsx (card.style.opacity), иначе на
      // reload/refresh кадр рисуется с дефолтной яркостью и моргает.
      sub.style.opacity = '0'
      words.forEach((word) => {
        word.style.opacity = String(WORD_BASE_OPACITY)
      })
      column.style.opacity = '0'

      // Высота обёртки — только в этой ветке (см. комментарий у useEffect):
      // на Tablet/Mobile pin'а нет вообще, и wrap должен остаться обычным
      // по высоте потоковым контейнером.
      wrap.style.height = `${(1 + REVEAL_VH) * 100}vh`

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: () => '+=' + window.innerHeight * REVEAL_VH,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress

          sub.style.opacity = String(windowProgress(progress, SUB_WINDOW))

          const titleT = windowProgress(progress, TITLE_WINDOW)
          words.forEach((word, i) => {
            const wp = windowProgress(titleT, wordWindow(i, words.length))
            word.style.opacity = String(WORD_BASE_OPACITY + (1 - WORD_BASE_OPACITY) * wp)
          })

          column.style.opacity = String(
            windowProgress(progress, COLUMN_WINDOW),
          )
        },
      })

      return () => {
        trigger.kill()
        wrap.style.height = ''
        sub.style.opacity = ''
        words.forEach((word) => {
          word.style.opacity = ''
        })
        column.style.opacity = ''
      }
    })

    mm.add('(max-width: 61.9375rem)', () => {
      if (reduceMotion()) {
        sub.style.opacity = '1'
        words.forEach((word) => {
          word.style.opacity = '1'
        })
        column.style.opacity = '1'
        return
      }

      sub.style.opacity = '0'
      words.forEach((word) => {
        word.style.opacity = String(WORD_BASE_OPACITY)
      })
      column.style.opacity = '0'

      const els = [sub, ...words, column]
      els.forEach((el) => {
        el.style.transition = 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)'
      })

      // Разовый шаг между словами при заливке — ~21 слово в заголовке,
      // 45ms даёт цепочке уложиться в ~1с, ощутимо, но не затянуто.
      const WORD_STEP_MS = 45

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          io.disconnect()

          sub.style.opacity = '1'

          words.forEach((word, i) => {
            word.style.transitionDelay = `${150 + i * WORD_STEP_MS}ms`
            word.style.opacity = '1'
          })

          column.style.transitionDelay = `${150 + words.length * WORD_STEP_MS + 200}ms`
          column.style.opacity = '1'
        },
        { threshold: 0.4 },
      )
      io.observe(pin)

      return () => {
        io.disconnect()
        els.forEach((el) => {
          el.style.transition = ''
          el.style.transitionDelay = ''
          el.style.opacity = ''
        })
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="residence" className="Residence bg-blue">
      <div className="Residence-top relative w-full">
        <div ref={wrapRef} className="Residence-top-wrap relative">
          <div
            ref={pinRef}
            className="Residence-top-pin sticky top-0 flex h-dvh flex-col justify-center overflow-hidden lg:justify-normal"
          >
            <div className="Residence-top-horizontal relative flex w-full h-55 flex-none items-center md:h-105 lg:h-auto lg:flex-1">
              <h2
                ref={trackRef}
                className="Residence-top-title whitespace-nowrap pl-5 pr-5 font-manrope text-[3.125rem] font-light leading-none tracking-[-0.125rem] text-light/60 md:text-[6.25rem] md:tracking-[-0.25rem] lg:text-[15.625rem] lg:tracking-[-0.625rem]"
              >
                The Water Residence where time slows
              </h2>

              <div
                aria-hidden
                className="Residence-top-circles pointer-events-none absolute inset-0"
              >
                <img
                  src={residenceCircleSide}
                  alt=""
                  className="absolute left-2.5 top-1/2 size-36 -translate-y-1/2 md:size-71 lg:left-0 lg:size-[44.2805rem]"
                />
                <img
                  src={residenceCircleCenter}
                  alt=""
                  className="absolute left-1/2 top-1/2 h-36.75 w-40 -translate-x-1/2 -translate-y-1/2 md:h-72.75 md:w-79 lg:left-[33.1291rem] lg:h-[50.2868rem] lg:w-[54.6808rem] lg:translate-x-0"
                />
                <img
                  src={residenceCircleSide}
                  alt=""
                  className="absolute right-2.5 top-1/2 size-36 -translate-y-1/2 md:size-71 lg:right-0 lg:size-[44.2805rem]"
                />
              </div>
            </div>

            <div className="Residence-top-footer flex w-full flex-col gap-4 pl-35 pr-2.5 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-10 md:px-2.5 lg:flex lg:flex-row lg:gap-5 lg:px-5 lg:pt-5 lg:pb-10">
              {TOP_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="Residence-top-card flex flex-col gap-2.5 font-manrope text-[0.875rem] font-medium tracking-[-0.00875rem] lg:flex-1 lg:text-[1.125rem] lg:tracking-[-0.01125rem]"
                >
                  <p className="text-light/60 leading-[1.3]">{card.title}</p>
                  <p className="text-light leading-[1.3] lg:max-w-125">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={bottomWrapRef} className="Residence-bottom-wrap relative w-full">
        <div
          ref={bottomPinRef}
          className="Residence-bottom flex flex-col items-center gap-35 px-2.5 py-5 md:gap-20 md:py-15 lg:sticky lg:top-0 lg:h-dvh lg:justify-center lg:gap-10 lg:overflow-hidden lg:px-0 lg:py-30"
        >
          <div className="Residence-bottom-header flex w-full flex-col gap-35 pt-35 text-light md:gap-5 md:pt-0 lg:flex-row lg:items-start lg:justify-between lg:px-5">
            <p
              ref={subRef}
              className="Residence-bottom-header-sub w-55.5 font-manrope text-[0.75rem] font-semibold leading-none tracking-[-0.0075rem] md:w-60 md:text-[0.875rem] md:tracking-[-0.00875rem] lg:w-60 lg:text-[0.875rem] lg:tracking-[-0.00875rem] lg:leading-[1.1]"
            >
              A private water residence built as a continuous, autonomous living
              system on the ocean
            </p>
            <p
              ref={titleRef}
              className="Residence-bottom-header-title pl-30 font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.0375rem] md:pl-0 md:text-[1.875rem] md:tracking-[-0.05625rem] lg:w-[79.375rem] lg:text-[3.75rem] lg:tracking-[-0.1125rem]"
            >
              {/* На tablet в макете нет ни отступа, ни разрыва — предложения
               * текут одним абзацем. На mobile/desktop каждое предложение —
               * отдельная "строка" со своим paragraph-indent (обычный CSS
               * text-indent не переживает `<br>` внутри одного `<p>`, поэтому
               * это два block-элемента, а не один текст с `<br>`, как ошибочно
               * отдаёт генератор кода Figma). Слова внутри каждого предложения
               * — через SplitWords (см. выше), чтобы построчно "доливать"
               * яркость по скроллу/по появлению в вьюпорте. */}
              <span className="indent-[4.6875rem] block md:inline md:indent-0 lg:block lg:indent-[20.625rem]">
                <SplitWords text="A residence shaped by water, horizon, and uninterrupted space." />
              </span>{' '}
              <span className="indent-[4.6875rem] block md:inline md:indent-0 lg:block lg:indent-[20.625rem]">
                <SplitWords text="Designed for autonomous living, where movement replaces schedules and time unfolds naturally." />
              </span>
            </p>
          </div>

          <div className="Residence-bottom-footer flex w-full items-center pl-30 md:pl-0 lg:pl-[59.9375rem]">
            <div
              ref={columnRef}
              className="Residence-bottom-column flex flex-1 flex-col gap-5 font-manrope text-[0.875rem] font-medium tracking-[-0.00875rem] md:grid md:grid-cols-2 md:gap-10 lg:flex lg:w-100 lg:flex-none lg:flex-col lg:gap-5 lg:text-[1.125rem] lg:tracking-[-0.01125rem]"
            >
              {BOTTOM_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="Residence-bottom-card flex flex-col gap-2.5"
                >
                  <p className="text-light/60 leading-[1.3]">{card.title}</p>
                  <p className="text-light leading-[1.3]">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
