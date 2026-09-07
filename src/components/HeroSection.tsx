import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import heroPortrait from '../assets/hero-portrait-b.webp'
import { reduceMotion, SplitChars } from '../lib/anim'
import { HERO_INTRO, typeReveal } from '../lib/heroIntro'

/** Скролл дозарастания Hero-img до fullscreen — см. «Скролл-переход
 * Hero → Intro» ниже. */
const GROW_VH = 2
/** Мёртвый буфер после роста — сюда «наезжает» Intro (см. IntroSection). */
const BUFFER_VH = 1
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
   * поэтому рост не сдвигает Hero-text-left/right). Border-radius уходит
   * к 0 после того, как диаметр проходит min(100vw, 100vh) — иначе видна
   * дуга круга поверх fullscreen-кадра. Hero-text-left/right и
   * Hero-subtitle не исчезают и не двигаются — только блюрятся и
   * перекрываются растущим оверлеем. IntroSection «наезжает» на буфер
   * BUFFER_VH снизу (см. -mt там). */
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

    const restingDiameter = img.offsetWidth

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (GROW_VH + BUFFER_VH),
      pin: true,
      scrub: true,
      onLeave: () => {
        zoom.style.opacity = '0'
      },
      onUpdate: (self) => {
        const growProgress = Math.min(
          1,
          self.progress / (GROW_VH / (GROW_VH + BUFFER_VH)),
        )
        const smallerDim = Math.min(window.innerWidth, window.innerHeight)
        const largerDim = Math.max(window.innerWidth, window.innerHeight)
        const diameter =
          restingDiameter +
          (largerDim - restingDiameter) * easeOutCubic(growProgress)

        zoom.style.opacity = growProgress > 0 ? '1' : '0'
        zoom.style.width = `${diameter}px`
        zoom.style.height = `${diameter}px`
        zoom.style.borderRadius =
          diameter <= smallerDim
            ? '50%'
            : `${Math.max(0, 50 - (50 * (diameter - smallerDim)) / (largerDim - smallerDim))}%`

        const blur = `blur(${growProgress * 16}px)`
        textLeft.style.filter = blur
        textRight.style.filter = blur
        subtitle.style.filter = blur
      },
    })

    return () => {
      trigger.kill()
      zoom.style.opacity = '0'
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
