import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import heroPortrait from '../assets/hero-portrait-b.webp'
import { reduceMotion, SplitChars } from '../lib/anim'
import { HERO_INTRO, typeReveal } from '../lib/heroIntro'
import { HERO_PIN_VH } from '../lib/scrollChain'
import { setNavTheme } from './NavBar'

/** Скролл-дистанция роста Hero-img, в высотах вьюпорта — см.
 * «Скролл-переход Hero → Intro» ниже. Общий источник с IntroSection.tsx
 * (см. src/lib/scrollChain.ts) — оттуда следующий pin в цепочке берёт
 * точную позицию конца этого пина. */
const PIN_VH = HERO_PIN_VH
/** Доля от финального диаметра (max(100vw, 100vh)), после которой на
 * широких/квадратных экранах (100vw >= 100vh, largerDim = vw) начинает
 * распрямляться border-radius — растёт диаметр при этом без остановки до
 * самого конца. На таких экранах диаметр дорастает ровно до 100vw и без
 * этой доли ждать буквального «пересечения 100vw» было бы некуда (это и
 * есть финальный размер) — окно распрямления схлопнулось бы в ноль и круг
 * превращался бы в квадрат мгновенным скачком в последний момент. Было
 * 0.8 (окно 20% от роста), утроили окно до 60%, чтобы распрямление не
 * ощущалось резким. На портретных экранах (100vh > 100vw) вместо этой
 * доли используется буквальное пересечение 100vw — см. onUpdate ниже. */
const RADIUS_START_FRACTION = 0.4
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
   * Figma): Hero-img растёт из центра до диаметра max(100vw, 100vh) —
   * fixed-оверлей поверх статичного Hero-img (не участвует в grid-layout,
   * поэтому рост не сдвигает Hero-text-left/right). Диаметр растёт
   * непрерывно весь пин, без остановок; border-radius начинает уходить
   * 50% → 0% только после того, как диаметр дорастёт до 100vw — на
   * портретных экранах (vh > vw) это буквальный порог (раньше распрямление
   * стартовало по доле от largerDim = vh и превращало круг в скруглённый
   * квадрат ещё до того, как он покрыл ширину вьюпорта); на широких/квадратных
   * экранах (vw >= vh, largerDim = vw) буквальный порог совпал бы с самим
   * концом роста и не оставил бы окна для распрямления, поэтому там
   * используется старая доля RADIUS_START_FRACTION от largerDim. В обоих
   * случаях распрямление доходит до 0% ровно к концу роста (largerDim =
   * max(vw, vh)) — раньше пробовали отдельную фазу «рост, потом стоп-кадр
   * на распрямление», но диаметр замирал и скролл ощущался как залипание
   * с резким скачком в конце; так распрямление идёт одновременно с
   * хвостом роста, без остановки.
   * Intro начинает наезжать на Hero снизу через margin-top и навбар
   * перекрашивается в светлый по той же прогрессии распрямления —
   * оба заканчиваются ровно к концу пина. Hero-text-left/right и
   * Hero-subtitle не исчезают и не двигаются — только блюрятся и
   * перекрываются растущим оверлеем.
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
        const largerDim = Math.max(window.innerWidth, window.innerHeight)

        const diameter =
          restingDiameter +
          (largerDim - restingDiameter) * easeOutCubic(progress)

        zoom.style.opacity = progress > EPSILON ? '1' : '0'
        zoom.style.width = `${diameter}px`
        zoom.style.height = `${diameter}px`

        const isPortrait = window.innerHeight > window.innerWidth
        const unwindStart = isPortrait
          ? window.innerWidth
          : largerDim * RADIUS_START_FRACTION
        const unwindEase = easeOutCubic(
          clamp((diameter - unwindStart) / (largerDim - unwindStart)),
        )
        zoom.style.borderRadius = `${(1 - unwindEase) * 50}%`

        if (intro) {
          intro.style.zIndex = '45'
          intro.style.marginTop = `${-unwindEase * 100}vh`
        }
        setNavTheme(unwindEase > EPSILON ? 'light' : 'dark')

        const blur = `blur(${progress * 16}px)`
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
