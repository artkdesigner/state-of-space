import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import heroPortrait from '../assets/hero-portrait-c.webp'
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
/** Лишний вьюпорт наезда Intro на Hero (см. комментарий у Hero-pin-wrap
 * ниже) — триггер темы навбара продлён на эту дистанцию (см. `end` ниже),
 * чтобы `setNavTheme` оставался её единственным источником вплоть до
 * самого момента, когда Intro физически перекрывает Hero, симметрично в
 * обе стороны скролла. Раньше триггер заканчивался на PIN_VH, и на весь
 * наезд тему подхватывал резервный IntersectionObserver в NavBar.tsx — он
 * реагирует на пересечение секцией верхней границы экрана, а не на
 * реальный прогресс наезда, поэтому при скролле НАЗАД триггерился в
 * момент, когда Hero заново "прилипает" (конец наезда), а не когда Intro
 * реально начинает открывать Hero (начало наезда) — навбар темнел на
 * целый вьюпорт раньше, чем нужно. */
const NAEZD_VH = 1
/** Доля общего прогресса пина (0..1), на которой заканчивается фаза роста
 * и начинается фаза распрямления. */
const GROWTH_FRACTION = GROWTH_PIN_VH / (GROWTH_PIN_VH + UNWIND_PIN_VH)
/** Нижняя граница Desktop-брейкпоинта (--breakpoint-lg = 62rem в
 * src/index.css) — на Desktop целевой диаметр Hero-img — 100vw, на
 * Tablet/Mobile — 100vh. */
const DESKTOP_BREAKPOINT = 992
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export default function HeroSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
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
   * Figma). Hero-секция — `position: sticky; top: 0` внутри обёртки
   * Hero-pin-wrap высотой (2 + PIN_VH) вьюпортов — на 1 вьюпорт больше,
   * чем "своя высота (1) + пин (PIN_VH)": этот лишний вьюпорт — не для
   * Hero, а для того, чтобы Hero осталась приклеенной ЕЩЁ на всю
   * дистанцию, пока Intro (см. IntroSection.tsx) наезжает на неё сверху
   * снизу-вверх (см. ниже про Intro-wrap с отрицательным `margin-top`).
   * Пока идёт скролл через первые PIN_VH вьюпортов обёртки, Hero
   * приклеена и играет анимация роста/распрямления; следующий 1 вьюпорт
   * Hero остаётся приклеенной (уже полностью развёрнутой — картинка на
   * весь экран, border-radius 0), НИЧЕГО в ней не меняется, и именно в
   * это время Intro поверх неё (выше z-index) въезжает снизу вверх и
   * полностью закрывает экран — настоящий cover-переход, а не
   * последовательная прокрутка. Только после того как Intro уже
   * полностью закрыла экран, Hero отклеивается и естественно
   * проскроллила прочь вверх — это происходит незаметно, под уже
   * непрозрачной Intro. Никакого JS для самого наезда (раньше был
   * margin-cancellation в onUpdate, см. историю коммитов и
   * scrollChain.ts) — весь эффект даёт разница между высотой Hero-wrap и
   * отрицательным `margin-top` на Intro-wrap.
   *
   * Прогресс (0..1 на PIN_VH вьюпортов, ПОКА Hero ещё приклеена) считается
   * тем же ScrollTrigger, что и раньше, но без `pin: true` — он больше не
   * трогает position/pin-спейсеры вообще, только читает scroll и вызывает
   * onUpdate, так что ScrollTrigger.refresh() ему для корректности не
   * нужен (см. комментарий в scrollChain.ts).
   *
   * Фаза 1 (первые GROWTH_PIN_VH вьюпортов, GROWTH_FRACTION общего
   * прогресса): Hero-img растёт из центра до целевого диаметра —
   * `position: absolute`-оверлей (центрирован внутри самой Hero-секции,
   * которая уже `sticky` и потому сама является containing block — пока
   * Hero приклеена, это визуально неотличимо от `fixed` по вьюпорту)
   * поверх статичного Hero-img (не участвует в grid-layout, поэтому рост
   * не сдвигает Hero-text-left/right). Целевой диаметр — 100vw на Desktop
   * (>= DESKTOP_BREAKPOINT), 100vh на Tablet/Mobile. border-radius всю эту
   * фазу остаётся 50% (полный круг). Рост диаметра — линейный по скроллу
   * (без easing): с easeOutCubic диаметр долетал до цели уже на ~80% фазы,
   * и последние ~20% скролла ничего не менялось — по ощущениям это
   * выглядело как остановка перед последующим резким распрямлением, а не
   * как плавный переход, привязанный к скроллу.
   * Фаза 2 (последние UNWIND_PIN_VH вьюпортов): диаметр больше не растёт
   * (заморожен на целевом значении), border-radius линейно уходит 50% →
   * 0%, и навбар перекрашивается в светлый по той же прогрессии.
   * Hero-text-left/right и Hero-subtitle не исчезают и не двигаются —
   * только блюрятся и перекрываются растущим оверлеем в течение фазы 1
   * (к её концу оверлей уже полностью их покрывает). Оверлей остаётся
   * видимым (opacity:1, диаметр=цель, radius:0) и после конца пина — он
   * `absolute`, поэтому естественно уезжает вместе с Hero, когда та
   * отклеивается и скроллится прочь; раньше здесь был `fixed`-оверлей,
   * который в `onLeave` резко прятали (`opacity:0`) — это оголяло на кадр
   * настоящий (маленький круглый, ещё заблюренный) Hero-img под ним прямо
   * в момент, когда Hero должна была выглядеть "полностью развёрнутой".
   *
   * `progress` при создании триггера (когда 'top top' уже выполнено на
   * скролле 0, что для первой секции — сразу) не строго 0, а исчезающе
   * малое положительное число (погрешность измерения) — поэтому пороги
   * ниже на `> EPSILON`, а не `> 0`, иначе оверлей мгновенно становится
   * полностью видимым в размере покоя и перекрывает ещё идущую
   * load-анимацию scale Hero-img. */
  /* Оверлей растёт из центра статичной Hero-img, а не из центра вьюпорта —
   * они совпадают на Desktop (текст стоит по бокам в один ряд с картинкой,
   * lg:grid-cols-3), но НЕ совпадают на Tablet/Mobile (grid-cols-1: текст
   * стоит над и под картинкой в колонку, поэтому сама картинка сдвинута от
   * центра вьюпорта). Измеряем реальный центр img и на его основе выставляем
   * left/top оверлею — без этого на Mobile/Tablet оверлей рос из чужой
   * точки, визуально «убегая» от статичной картинки под ним. Пересчитываем
   * на resize (смена брейкпоинта/поворот экрана) и после подгрузки шрифта
   * (self-hosted Manrope может доехать после первого рендера и сдвинуть
   * текст, а с ним и позицию img в колоночной раскладке). */
  useLayoutEffect(() => {
    const zoom = zoomRef.current
    const img = imgRef.current
    const section = sectionRef.current
    if (!zoom || !img || !section) return

    const positionZoom = () => {
      const imgRect = img.getBoundingClientRect()
      const sectionRect = section.getBoundingClientRect()
      zoom.style.left = `${imgRect.left - sectionRect.left + imgRect.width / 2}px`
      zoom.style.top = `${imgRect.top - sectionRect.top + imgRect.height / 2}px`
    }

    positionZoom()
    const resizeObserver = new ResizeObserver(positionZoom)
    resizeObserver.observe(section)
    document.fonts.ready.then(positionZoom)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    const zoom = zoomRef.current
    const img = imgRef.current
    const textLeft = textLeftRef.current
    const textRight = textRightRef.current
    const subtitle = subtitleRef.current
    if (!wrap || !zoom || !img || !textLeft || !textRight || !subtitle) {
      return
    }
    if (reduceMotion()) return

    const EPSILON = 0.005
    const restingDiameter = img.offsetWidth

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (PIN_VH + NAEZD_VH),
      scrub: true,
      onUpdate: (self) => {
        // Пересчитываем обратно в 0..1 по исходному, более короткому
        // PIN_VH-отсчёту (см. NAEZD_VH выше) и клэмпим — сама
        // растяжка/распрямление доигрывает и замирает ровно там же, где и
        // раньше, лишний NAEZD_VH продлевает только работу onUpdate (и,
        // значит, setNavTheme) до конца наезда, не трогая темп анимации.
        const progress = clamp((self.progress * (PIN_VH + NAEZD_VH)) / PIN_VH)
        const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT
        const targetDiameter = isDesktop
          ? window.innerWidth
          : window.innerHeight

        const growProgress = clamp(progress / GROWTH_FRACTION)
        const diameter =
          restingDiameter + (targetDiameter - restingDiameter) * growProgress

        zoom.style.opacity = progress > EPSILON ? '1' : '0'
        zoom.style.width = `${diameter}px`
        zoom.style.height = `${diameter}px`

        const unwindProgress = clamp(
          (progress - GROWTH_FRACTION) / (1 - GROWTH_FRACTION),
        )
        zoom.style.borderRadius = `${(1 - unwindProgress) * 50}%`

        setNavTheme(unwindProgress > EPSILON ? 'light' : 'dark')

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
    <div
      ref={wrapRef}
      className="Hero-pin-wrap relative"
      /* dvh, не vh — иначе на iOS Safari эта высота (и margin-top на
       * Intro-pin-wrap) отсчитывается от "большого" вьюпорта со скрытым
       * тулбаром, а `onUpdate` выше считает дистанцию через
       * window.innerHeight (актуальный, "маленький" вьюпорт при видимом
       * тулбаре) — расхождение давало пробел по скроллу перед наездом
       * Intro. */
      style={{ height: `${(2 + PIN_VH) * 100}dvh` }}
    >
      <section
        id="hero"
        ref={sectionRef}
        className="Hero sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden border-b border-dark bg-light p-2.5 lg:p-5"
      >
        <span
          ref={zoomRef}
          aria-hidden="true"
          className="Hero-img-zoom pointer-events-none absolute z-40 block -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-0"
        >
          <img src={heroPortrait} alt="" className="size-full object-cover" />
        </span>

        <h1 className="grid w-full grid-cols-1 items-center justify-items-center gap-5 font-manrope font-semibold uppercase leading-none tracking-[-0.04em] text-dark md:gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          <span
            ref={textLeftRef}
            className="Hero-text-left whitespace-nowrap text-[2rem] text-blue md:text-[3.4375rem] lg:justify-self-start lg:text-[6.875rem]"
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
    </div>
  )
}
