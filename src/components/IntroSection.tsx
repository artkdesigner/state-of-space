import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import introLogo from '../assets/intro-logo.svg'
import { reduceMotion } from '../lib/anim'
import { INTRO_PIN_VH } from '../lib/scrollChain'

/** Собственная (reveal) фаза Intro, в высотах вьюпорта, пока Intro
 * приклеена вверху — см. «Скролл-переход Intro → Location1» ниже. Общий
 * источник с HeroSection.tsx/Location1Section.tsx (см.
 * src/lib/scrollChain.ts). Наезд самого Intro поверх Hero, и наезд
 * Location1 поверх Intro сюда не входят — оба происходят бесплатно, за
 * счёт собственной высоты обёрток (см. HeroSection.tsx и комментарий у
 * Intro-pin-wrap ниже). */
const PIN_VH = INTRO_PIN_VH
/** Окна reveal-прогресса (0..1 внутри PIN_VH) для каждого элемента — с
 * нахлёстом, чтобы получился каскад, а не одновременное появление всех
 * трёх сразу. Порядок и нахлёст сохраняют прежнюю задумку (title, потом
 * logo, потом bottom-wrap — раньше это было пороками
 * IntersectionObserver 0.5 / 0.75 / 1 у <Reveal>). */
const TITLE_WINDOW: [number, number] = [0, 0.5]
const LOGO_WINDOW: [number, number] = [0.25, 0.75]
const BOTTOM_WRAP_WINDOW: [number, number] = [0.5, 1]

/** Reveal-триггер стартует раньше, чем сам wrap доезжает до 'top top' —
 * на эту долю PIN_VH (в вьюпортах), т.е. ещё во время последней четверти
 * наезда Intro на Hero. `end` остаётся прежним (натуральная точка
 * `wrapTop + PIN_VH`, на неё завязан `location1PinStart` в
 * scrollChain.ts) — сдвигается только начало, поэтому окна элементов
 * растягиваются на (1 + EARLY_SHIFT) × PIN_VH вместо PIN_VH. */
const EARLY_SHIFT = 0.25

/** Окно (0..1 внутри своего 1-вьюпортного exitTrigger, см. ниже), за
 * которое Intro-title/-logo/-bottom-wrap гаснут до конца — по референсному
 * видео пользователя (см. историю чата) к моменту, когда снизу начинает
 * наезжать скруглённый край Location1, текста уже не видно. */
const TEXT_EXIT_WINDOW: [number, number] = [0, 0.3]
/** Окно того же exitTrigger, за которое Intro "схлопывается" снизу вверх
 * (clip-path inset) — стартует уже после TEXT_EXIT_WINDOW, чтобы текст
 * гарантированно погас раньше, чем начнётся заметное схлопывание. */
const RETREAT_WINDOW: [number, number] = [0.3, 1]
/** Максимальный радиус нижних углов на пике схлопывания — тот же приём и
 * то же значение, что RISE_VH-скругление Location1 в CliffSection.tsx
 * (см. riseTrigger там), для единого визуального языка между всеми
 * переходами цепочки. */
const RETREAT_RADIUS_VW = 45

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const windowProgress = (p: number, [start, end]: [number, number]) =>
  clamp((p - start) / (end - start))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function IntroSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const bottomWrapRef = useRef<HTMLDivElement>(null)

  /* Скролл-переход внутри Intro (см. покадровую сцену в Figma). Intro —
   * `position: sticky; top: 0` внутри обёртки Intro-pin-wrap высотой
   * (2 + PIN_VH) вьюпортов, сдвинутой на `margin-top: -100vh` — этот
   * отрицательный margin утягивает документный верх Intro-wrap ровно на
   * 1 вьюпорт РАНЬШЕ, чем закончился бы Hero-pin-wrap "по прямому
   * потоку" — то есть ровно туда, где заканчивается собственная
   * (PIN_VH-часть) анимация Hero, пока сама Hero остаётся приклеенной ещё
   * на 1 вьюпорт (см. HeroSection.tsx). За счёт этого Intro въезжает
   * снизу вверх (её `top` от `100vh` до `0`, обычный document flow, без
   * единой строчки JS) и полностью закрывает уже неподвижную Hero под
   * собой (Intro — более высокий z-index) — настоящий cover-переход, а
   * не последовательная прокрутка, где обе секции едут одновременно и
   * видны одновременно располовиненные на экране. Этот же margin-приём —
   * статический CSS, задаётся один раз при рендере, не пересчитывается
   * в JS на каждый тик скролла — не путать с margin-cancellation, который
   * раньше делали через `onUpdate` GSAP-пина и который ломался (см.
   * scrollChain.ts и историю коммитов).
   *
   * Как только Intro-wrap "доехала" (margin утянул её верх к 0vh
   * относительно исходной точки), играет её собственная PIN_VH-анимация
   * (Intro-title/Intro-logo/Intro-bottom-wrap opacity, с
   * нахлёстом по TITLE_WINDOW/LOGO_WINDOW/BOTTOM_WRAP_WINDOW, линейно по
   * скроллу — нелинейный easing вместе с отдельными окнами создаёт
   * ощущение «стоп-кадр → резкий скачок»). `(2 + PIN_VH)` вместо
   * `(1 + PIN_VH)` — тот же приём, что у Hero-wrap (см. HeroSection.tsx):
   * лишний вьюпорт держит Intro приклеенной (уже полностью раскрытой) ещё
   * на всю дистанцию, пока Location1 (следующий сиблинг, подтянутый
   * вверх своим собственным статическим `margin-top: -100vh`, см.
   * Location1Section.tsx) въезжает снизу и полностью закрывает Intro —
   * тот же настоящий cover-переход, что у Hero → Intro, а не
   * последовательная прокрутка.
   *
   * Этот лишний вьюпорт — не просто пассивный hold: это ещё и окно
   * exitTrigger (см. ниже), где Intro сама визуально "передаёт" наезжающему
   * снизу Location1 скруглённый край — по референсному видео пользователя
   * (см. историю чата), зеркально тому, как Location1 передаёт его дальше
   * Cliff (см. riseTrigger в CliffSection.tsx). Intro при этом физически
   * никуда не едет (остаётся sticky) — "схлопывание" снизу вверх имитирует
   * clip-path inset на самой секции, с округлением на двух нижних углах
   * (RETREAT_RADIUS_VW, тот же приём и то же значение, что у Cliff). Текст
   * (title/logo/bottom-wrap) гаснет ДО начала схлопывания (TEXT_EXIT_WINDOW
   * заканчивается раньше, чем стартует RETREAT_WINDOW) — в референсе к
   * моменту, когда виден скруглённый край, текста уже нет. Только после
   * того как clip-path схлопнулся полностью (Intro визуально исчезла под
   * уже непрозрачной Location1), Intro отклеивается и естественно уезжает
   * прочь — уже незаметно.
   *
   * ScrollTrigger здесь без `pin: true` — он не трогает position/pin-
   * спейсеры вообще, только читает scroll и вызывает onUpdate, поэтому
   * ScrollTrigger.refresh() ему для корректности не нужен (см. комментарий
   * в scrollChain.ts). */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const title = titleRef.current
    const logo = logoRef.current
    const bottomWrap = bottomWrapRef.current
    if (!wrap || !section || !title || !logo || !bottomWrap) return

    if (reduceMotion()) {
      title.style.opacity = '1'
      logo.style.opacity = '1'
      bottomWrap.style.opacity = '1'
      return
    }

    // Абсолютная doc-flow позиция wrap (та же величина, что резолвит
    // 'top top') — устойчива к скроллу, пока ничего не пинит wrap (см.
    // riseCompleteStart в PresenceSection.tsx, тот же приём).
    const wrapTop = () => {
      const r = wrap.getBoundingClientRect()
      return r.top + window.scrollY
    }

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() - window.innerHeight * PIN_VH * EARLY_SHIFT,
      end: () => wrapTop() + window.innerHeight * PIN_VH,
      scrub: true,
      onUpdate: (self) => {
        const revealProgress = self.progress

        const titleT = windowProgress(revealProgress, TITLE_WINDOW)
        title.style.opacity = String(titleT)

        const logoT = windowProgress(revealProgress, LOGO_WINDOW)
        logo.style.opacity = String(logoT)

        const bottomWrapT = windowProgress(revealProgress, BOTTOM_WRAP_WINDOW)
        bottomWrap.style.opacity = String(bottomWrapT)
      },
    })

    const exitTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() + window.innerHeight * PIN_VH,
      end: () => wrapTop() + window.innerHeight * (PIN_VH + 1),
      scrub: true,
      onUpdate: (self) => {
        const exitProgress = self.progress

        const textT = 1 - windowProgress(exitProgress, TEXT_EXIT_WINDOW)
        title.style.opacity = String(textT)
        logo.style.opacity = String(textT)
        bottomWrap.style.opacity = String(textT)

        const retreat = windowProgress(exitProgress, RETREAT_WINDOW)
        const radius = easeOutCubic(retreat) * RETREAT_RADIUS_VW
        section.style.clipPath =
          `inset(0 0 ${retreat * 100}% 0 round 0 0 ${radius}vw ${radius}vw)`
      },
    })

    return () => {
      trigger.kill()
      exitTrigger.kill()
      title.style.opacity = ''
      logo.style.opacity = ''
      bottomWrap.style.opacity = ''
      section.style.clipPath = ''
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Intro-pin-wrap relative z-[45]"
      style={{ height: `${(2 + PIN_VH) * 100}vh`, marginTop: '-100vh' }}
    >
      <section
        id="intro"
        ref={sectionRef}
        className="Intro sticky top-0 flex h-dvh flex-col items-center justify-between overflow-hidden bg-brown px-2.5 py-15 text-light lg:px-5 lg:py-30"
      >
        <h2
          ref={titleRef}
          className="Intro-title mx-auto max-w-[94rem] text-center font-manrope text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.03em] opacity-0 md:text-[1.875rem] lg:text-[3.75rem]"
        >
          Live a unique experience inspired by the natural rhythm of the
          ocean. An experience where the important thing is not a change of
          scenery, but the inner sensation.
        </h2>

        <img
          ref={logoRef}
          src={introLogo}
          alt="State of Space"
          className="Intro-logo size-25 opacity-0"
        />

        <div
          ref={bottomWrapRef}
          className="Intro-bottom-wrap grid w-full grid-cols-1 items-start gap-5 font-manrope text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] text-light/60 opacity-0 md:grid-cols-[10.75rem_1fr_10.75rem] lg:grid-cols-[1fr_37.75rem_1fr] lg:gap-0 lg:text-[1.125rem]"
        >
          <p className="Intro-bottom-title order-1 whitespace-nowrap text-center md:order-none md:text-left">
            Ocean Space
          </p>
          <p className="Intro-bottom-sub order-3 text-center md:order-none">
            Inspired by ocean landscapes and minimalist architecture, the
            project examines how spatial design influences focus, perception,
            and cognitive balance. Natural elements are used intentionally -
            to simplify, slow down, and clarify experience.
          </p>
          <p className="Intro-bottom-year order-2 whitespace-nowrap text-center md:order-none md:text-right">
            2026
          </p>
        </div>
      </section>
    </div>
  )
}
