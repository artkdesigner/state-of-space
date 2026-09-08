import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import heroPortrait from '../assets/hero-portrait-b.webp'
import { reduceMotion, SplitChars } from '../lib/anim'
import { HERO_INTRO, typeReveal } from '../lib/heroIntro'
import { HERO_PIN_VH } from '../lib/scrollChain'
import { setNavTheme } from './NavBar'

/** Общая скролл-дистанция Hero-пина, в высотах вьюпорта — см.
 * «Скролл-переход Hero → Intro» ниже. Общий источник с IntroSection.tsx
 * (см. src/lib/scrollChain.ts) — оттуда следующий pin в цепочке берёт
 * точную позицию конца этого пина. Состоит из GROWTH_PIN_VH + UNWIND_PIN_VH. */
const PIN_VH = HERO_PIN_VH
/** Первая фаза пина: Hero-img растёт из центра до целевого диаметра. */
const GROWTH_PIN_VH = 2
/** Вторая фаза пина: диаметр заморожен, border-radius уходит 50% → 0%. */
const UNWIND_PIN_VH = 1
/** Доля общего прогресса пина (0..1), на которой заканчивается фаза роста
 * и начинается фаза распрямления. */
const GROWTH_FRACTION = GROWTH_PIN_VH / (GROWTH_PIN_VH + UNWIND_PIN_VH)
/** Нижняя граница Desktop-брейкпоинта (--breakpoint-lg = 62rem в
 * src/index.css) — на Desktop целевой диаметр Hero-img — 100vw, на
 * Tablet/Mobile — 100vh. */
const DESKTOP_BREAKPOINT = 992
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLSpanElement>(null)
  const zoomRef = useRef<HTMLSpanElement>(null)
  const textLeftRef = useRef<HTMLSpanElement>(null)
  const textRightRef = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  /* Интро: Hero-img растёт из центра, Hero-text-left/right печатаются
   * побуквенно, Hero-subtitle выезжает снизу после них — см.
   * src/lib/heroIntro.ts (тайминг восстановлен по 6-кадровой сцене в
   * Figma). useLayoutEffect — чтобы стартовое состояние (scale 0,
   * буквы/subtitle невидимы) применилось до первой отрисовки. */
  useLayoutEffect(() => {
    const img = imgRef.current
    const subtitle = subtitleRef.current
    if (!img || !subtitle) return

    if (reduceMotion()) {
      gsap.set(img, { scale: 1 })
      gsap.set(subtitle, { xPercent: -50, yPercent: 50, opacity: 1 })
      typeReveal(textLeftRef.current, { delay: 0, duration: 0 })
      typeReveal(textRightRef.current, { delay: 0, duration: 0 })
      return
    }

    gsap.set(subtitle, { xPercent: -50 })

    const imgTween = gsap.fromTo(
      img,
      { scale: 0 },
      {
        scale: 1,
        duration: HERO_INTRO.img.duration,
        delay: HERO_INTRO.img.delay,
        ease: HERO_INTRO.img.ease,
      },
    )
    const subtitleTween = gsap.fromTo(
      subtitle,
      { yPercent: 160, opacity: 0 },
      {
        yPercent: 50,
        opacity: 1,
        duration: HERO_INTRO.subtitle.duration,
        delay: HERO_INTRO.subtitle.delay,
        ease: HERO_INTRO.subtitle.ease,
      },
    )
    const leftTween = typeReveal(textLeftRef.current, HERO_INTRO.textLeft)
    const rightTween = typeReveal(textRightRef.current, HERO_INTRO.textRight)

    return () => {
      imgTween.kill()
      subtitleTween.kill()
      leftTween?.kill()
      rightTween?.kill()
    }
  }, [])

  /* Скролл-переход Hero → Intro (см. покадровую сцену «Hero to Intro» в
   * Figma) — двухфазный пин на GROWTH_PIN_VH + UNWIND_PIN_VH:
   * Фаза 1 (первые GROWTH_PIN_VH вьюпортов, GROWTH_FRACTION общего
   * прогресса): Hero-img растёт из центра до целевого диаметра — fixed-
   * оверлей поверх статичного Hero-img (не участвует в grid-layout,
   * поэтому рост не сдвигает Hero-text-left/right). Целевой диаметр — 100vw
   * на Desktop (>= DESKTOP_BREAKPOINT), 100vh на Tablet/Mobile — по
   * заданию продукта картинка должна долетать ровно до ширины экрана на
   * Desktop и до высоты экрана на более узких брейкпоинтах, а не до
   * max(vw, vh), как раньше. border-radius всю эту фазу остаётся 50%
   * (полный круг).
   * Фаза 2 (последние UNWIND_PIN_VH вьюпортов): диаметр больше не растёт
   * (заморожен на целевом значении), border-radius уходит 50% → 0%.
   * Intro начинает наезжать на Hero снизу через margin-top и навбар
   * перекрашивается в светлый по той же прогрессии распрямления — оба
   * идут только во второй фазе и заканчиваются ровно к концу пина.
   * Hero-text-left/right и Hero-subtitle не исчезают и не двигаются —
   * только блюрятся и перекрываются растущим оверлеем в течение фазы 1
   * (к её концу оверлей уже полностью их покрывает).
   *
   * Создаётся сразу при монтировании (без задержки — так же, как во
   * всех остальных pin-секциях сайта): любая задержка сдвигает момент
   * появления спейсера Hero во времени, и все НИЖЕ идущие секции,
   * измеряющие свой 'top top' раньше (при монтировании), закэшируют
   * стартовую позицию без учёта этого спейсера. ScrollTrigger.refresh()
   * эту позицию для уже созданных pin-триггеров не пересчитывает
   * (проверено эмпирически), так что рассинхронизация не лечится
   * постфактум — её нельзя допускать вовсе.
   *
   * `progress` при создании триггера (когда 'top top' уже выполнено на
   * скролле 0, что для первой секции — сразу) не строго 0, а исчезающе
   * малое положительное число (погрешность измерения) — поэтому пороги
   * ниже на `> EPSILON`, а не `> 0`, иначе оверлей мгновенно становится
   * полностью видимым в размере покоя и перекрывает ещё идущую
   * load-анимацию scale Hero-img. */
  useEffect(() => {
    const section = sectionRef.current
    const zoom = zoomRef.current
    const img = imgRef.current
    const textLeft = textLeftRef.current
    const textRight = textRightRef.current
    const subtitle = subtitleRef.current
    if (!section || !zoom || !img || !textLeft || !textRight || !subtitle) {
      return
    }
    if (reduceMotion()) return

    const EPSILON = 0.005
    const restingDiameter = img.offsetWidth
    const intro = document.getElementById('intro')

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * PIN_VH,
      pin: true,
      scrub: true,
      onLeave: () => {
        zoom.style.opacity = '0'
        /* Собственный pin Intro ('top top' в IntroSection) кэшируется при
         * монтировании, пока marginTop у intro ещё 0 — без refresh здесь
         * его стартовая точка не учитывает финальный сдвиг на -100vh,
         * из-за чего Intro не фиксируется вовремя и продолжает уезжать
         * вверх вместе со скроллом. См. аналогичный комментарий и refresh
         * в IntroSection.tsx для перехода Intro → Location1. */
        ScrollTrigger.refresh()
      },
      onUpdate: (self) => {
        const progress = self.progress
        const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT
        const targetDiameter = isDesktop
          ? window.innerWidth
          : window.innerHeight

        const growProgress = clamp(progress / GROWTH_FRACTION)
        const diameter =
          restingDiameter +
          (targetDiameter - restingDiameter) * easeOutCubic(growProgress)

        zoom.style.opacity = progress > EPSILON ? '1' : '0'
        zoom.style.width = `${diameter}px`
        zoom.style.height = `${diameter}px`

        const unwindProgress = clamp(
          (progress - GROWTH_FRACTION) / (1 - GROWTH_FRACTION),
        )
        const unwindEase = easeOutCubic(unwindProgress)
        zoom.style.borderRadius = `${(1 - unwindEase) * 50}%`

        if (intro) {
          intro.style.zIndex = '45'
          intro.style.marginTop = `${-unwindEase * 100}vh`
        }
        setNavTheme(unwindEase > EPSILON ? 'light' : 'dark')

        const blur = `blur(${growProgress * 16}px)`
        textLeft.style.filter = blur
        textRight.style.filter = blur
        subtitle.style.filter = blur
      },
    })

    return () => {
      trigger.kill()
      zoom.style.opacity = '0'
      if (intro) {
        intro.style.zIndex = ''
        intro.style.marginTop = ''
      }
    }
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="Hero relative flex min-h-dvh flex-col items-center justify-center border-b border-dark bg-light p-2.5 lg:p-5"
    >
      <span
        ref={zoomRef}
        aria-hidden="true"
        className="Hero-img-zoom pointer-events-none fixed left-1/2 top-1/2 z-40 block -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-0"
      >
        <img src={heroPortrait} alt="" className="size-full object-cover" />
      </span>

      <h1 className="grid w-full grid-cols-1 items-center justify-items-center gap-5 font-manrope font-semibold uppercase leading-none tracking-[-0.04em] text-dark md:gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
        <span
          ref={textLeftRef}
          className="Hero-text-left whitespace-nowrap text-[2rem] md:text-[3.4375rem] lg:justify-self-start lg:text-[6.875rem]"
        >
          <SplitChars text="III spaces" />
        </span>

        <span
          ref={imgRef}
          className="Hero-img relative block aspect-square w-85 shrink-0 overflow-hidden rounded-full md:w-125"
        >
          <img
            src={heroPortrait}
            alt="A woman standing on a coastal cliff at sunset, her dress caught by the wind"
            fetchPriority="high"
            className="size-full object-cover"
          />
        </span>

        <span
          ref={textRightRef}
          className="Hero-text-right whitespace-nowrap text-[2rem] md:text-[3.4375rem] lg:justify-self-end lg:text-[6.875rem]"
        >
          <SplitChars text="III states" />
        </span>
      </h1>

      <p
        ref={subtitleRef}
        className="Hero-subtitle absolute bottom-[2.125rem] left-1/2 w-70.5 text-center text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] text-dark/60 md:bottom-[2.3125rem] md:w-65 lg:bottom-[2.625rem] lg:w-105 lg:text-[1.125rem]"
      >
        A quiet return to yourself.
        <br />
        Shaped by space, rhythm, and presence.
      </p>
    </section>
  )
}
