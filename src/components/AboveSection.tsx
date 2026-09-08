import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import aboveBg from '../assets/above-bg.webp'

/** Внешний край кольца — фиксирован всегда, толщина растёт только внутрь
 * (см. фазу thicken ниже). Радиус подобран так, чтобы влезать в SVG
 * viewBox 0 0 100 100 (максимум 50). */
const RING_OUTER = 50
/** Толщина кольца в состоянии покоя — из самого SVG-ассета Above-circle-
 * wrap в Figma (узел "Above to Capacity"): в исходном 600.5×600.5
 * viewBox внешний радиус 300, внутренний 285, т.е. толщина 15 = 5% от
 * радиуса. Тот же процент от RING_OUTER здесь. */
const RING_STROKE_RESTING = RING_OUTER * 0.05
const RING_RADIUS = RING_OUTER - RING_STROKE_RESTING / 2
const RING_INNER_RESTING = RING_OUTER - RING_STROKE_RESTING
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** Скролл-дистанция наезда Qualities на Above, в высотах вьюпорта — тот же
 * приём, что у Hero→Intro/Intro→Location1 (см. HeroSection.tsx/
 * IntroSection.tsx): статический `margin-top: -100vh` на Above-pin-wrap
 * утягивает её документный верх ровно на этот же 1 вьюпорт раньше, чем
 * закончился бы естественный поток после Qualities — Above естественно
 * въезжает снизу вверх поверх ещё видимой Qualities (у неё временно выше
 * z-index, см. эффект ниже) и полностью закрывает её, без единой строчки
 * JS на саму позицию ни у той, ни у другой стороны. */
const RISE_VH = 1
/** Собственная (reveal) фаза Above — раскрытие: circle-wrap проявляется
 * из прозрачности, заливка кольца растёт 0 → 100%, левый заголовок
 * целиком въезжает и, не останавливаясь, продолжает движение и уезжает
 * дальше, правый — въезжает следом, в высотах вьюпорта. */
const REVEAL_VH = 3
/** Утолщение кольца в сплошной диск (внешний край не двигается) +
 * скрытие правого заголовка, в высотах вьюпорта. Above на этом
 * заканчивает расти — дальше растёт круглая маска Capacity (см.
 * CapacitySection.tsx), подхватывающая диаметр уже сплошного диска. */
const THICKEN_VH = 2
const TOTAL_PIN_VH = REVEAL_VH + THICKEN_VH
/** Граница фаз 1/2 внутри общего прогресса самопина Above, 0..1. */
const REVEAL_BOUNDARY = REVEAL_VH / TOTAL_PIN_VH

/** Доля фазы 1, за которую Above-circle-wrap успевает проявиться из
 * прозрачности (см. покадровую сцену в Figma — заметно опережает оба
 * заголовка). */
const WRAP_FADE_FRACTION = 0.15
/** Середина фазы 1 (доля общего REVEAL_VH, 0..1) — контрольная точка
 * хореографии заголовков (см. правки пользователя 2026-09-08): ровно на
 * ней кольцо заполнено на 50%, левый заголовок должен быть уже ПОЛНОСТЬЮ
 * виден и тут же, не останавливаясь, продолжает движение вверх дальше —
 * прячется за оставшуюся половину фазы 1, синхронно с тем, как правый
 * заголовок въезжает и полностью появляется ровно к концу фазы 1 (кольцо
 * = 100%). Кольцо намеренно НЕ получает собственный easing поверх
 * `reveal` — `ringFill = reveal` напрямую, иначе "заполнено на 50%" и
 * "left полностью виден" разъезжались бы (реальная синхронизация тогда
 * была бы не по факту, а по совпадению конкретных чисел easeOutCubic). */
const TITLE_HALFWAY = 0.5

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t: number) => t * t * t

export default function AboveSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const circleWrapRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)
  const leftTitleRef = useRef<HTMLParagraphElement>(null)
  const rightTitleRef = useRef<HTMLParagraphElement>(null)

  /* Переход Qualities → Above → Capacity (см. покадровую сцену в Figma,
   * «Qualities to Above 1..8» и «Above to Capacity 1..7»). Above —
   * `position: sticky; top: 0` внутри обёртки Above-pin-wrap высотой
   * (2 + TOTAL_PIN_VH) вьюпортов, сдвинутой на `margin-top: -100vh» — тот
   * же приём, что у Location1-pin-wrap/Cliff-pin-wrap (см.
   * Location1Section.tsx/CliffSection.tsx). `(2 + TOTAL_PIN_VH)` вместо
   * `(1 + TOTAL_PIN_VH)` — лишний вьюпорт держит Above приклеенной (уже
   * полностью раскрытой, диск сплошной) ещё на всю дистанцию, пока
   * Capacity (см. CapacitySection.tsx, тот же margin-приём) въезжает
   * снизу и полностью закрывает её растущей круглой маской — настоящий
   * cover-переход.
   *
   * 1) riseTrigger (RISE_VH вьюпорт ПЕРЕД wrapTop, пока Above ещё
   *    физически въезжает поверх Qualities) — чистая косметика:
   *    скругление НИЖНИХ углов Qualities по мере того, как она пропадает
   *    за верхней границей (зеркально тому, как распрямляется верхний
   *    край в IntroSection.tsx, но снизу, как в CliffSection.tsx).
   *    z-index Qualities поднят один раз при монтировании (не по кадрам)
   *    — при их обычном position:relative без этого Above (позже в DOM)
   *    перекрыла бы Qualities по умолчанию.
   * 2) trigger (TOTAL_PIN_VH вьюпортов, Above уже приклеена) — раскрытие
   *    + утолщение, см. onUpdate ниже. */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const qualities = document.getElementById('qualities')
    const circleWrap = circleWrapRef.current
    const progress = progressRef.current
    const leftTitle = leftTitleRef.current
    const rightTitle = rightTitleRef.current
    if (
      !wrap ||
      !section ||
      !qualities ||
      !circleWrap ||
      !progress ||
      !leftTitle ||
      !rightTitle
    ) {
      return
    }
    if (reduceMotion()) return

    qualities.style.zIndex = '47'

    // Стартовое (скрытое) состояние — выставляем сразу, а не ждём первого
    // onUpdate у trigger: пока прогресс ровно 0, GSAP его не вызывает, и
    // до реального начала фазы элементы иначе на мгновение показывались
    // бы в дефолтном (полностью раскрытом) виде.
    circleWrap.style.opacity = '0'
    leftTitle.style.transform = 'translateY(100%)'
    rightTitle.style.transform = 'translateY(100%)'
    progress.style.strokeDashoffset = String(RING_CIRCUMFERENCE)

    const wrapTop = () => {
      const r = wrap.getBoundingClientRect()
      return r.top + window.scrollY
    }

    const riseTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() - window.innerHeight * RISE_VH,
      end: wrapTop,
      scrub: true,
      onUpdate: (self) => {
        const radius = easeOutCubic(self.progress) * 45
        qualities.style.borderBottomLeftRadius = `${radius}vw`
        qualities.style.borderBottomRightRadius = `${radius}vw`
      },
    })

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: wrapTop,
      end: () => wrapTop() + window.innerHeight * TOTAL_PIN_VH,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress

        // Фаза 1 — раскрытие: единое эазед-время `reveal` управляет и
        // кольцом, и обоими заголовками. Кольцо = reveal напрямую (без
        // дополнительного easing) — так "заполнено на TITLE_HALFWAY" и
        // "заголовок полностью виден/спрятан" гарантированно совпадают
        // по построению, а не по случайному совпадению кривых.
        const reveal = easeOutCubic(clamp(p / REVEAL_BOUNDARY))
        circleWrap.style.opacity = String(clamp(reveal / WRAP_FADE_FRACTION))
        const ringFill = reveal

        // Left: въезжает 0 → TITLE_HALFWAY (100% → 0%), тут же без паузы
        // продолжает и прячется TITLE_HALFWAY → 1 (0% → -100%).
        const leftEnter = easeOutCubic(clamp(reveal / TITLE_HALFWAY))
        const leftExit = easeOutCubic(
          clamp((reveal - TITLE_HALFWAY) / (1 - TITLE_HALFWAY)),
        )
        const leftPhase1Y =
          reveal < TITLE_HALFWAY ? (1 - leftEnter) * 100 : -leftExit * 100

        // Right: скрыт весь первый отрезок, въезжает только
        // TITLE_HALFWAY → 1, финиширует полностью видимым ровно к концу
        // фазы 1 (кольцо = 100%).
        const rightEnter = easeOutCubic(
          clamp((reveal - TITLE_HALFWAY) / (1 - TITLE_HALFWAY)),
        )
        const rightPhase1Y =
          reveal < TITLE_HALFWAY ? 100 : (1 - rightEnter) * 100

        // Фаза 2 — утолщение: кольцо становится сплошным диском (внешний
        // край не двигается), правый заголовок сразу без паузы продолжает
        // уезжать вверх и прячется ровно к концу фазы (левый уже скрыт,
        // дальше не трогаем).
        const thicken = clamp((p - REVEAL_BOUNDARY) / (1 - REVEAL_BOUNDARY))
        const rightExit = easeOutCubic(thicken)
        const rightPhase2Y = -rightExit * 100

        leftTitle.style.transform = `translateY(${p < REVEAL_BOUNDARY ? leftPhase1Y : -100}%)`
        rightTitle.style.transform = `translateY(${
          p < REVEAL_BOUNDARY ? rightPhase1Y : rightPhase2Y
        }%)`

        const hole = (1 - easeInCubic(thicken)) * RING_INNER_RESTING
        progress.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - ringFill),
        )
        progress.setAttribute('r', String((RING_OUTER + hole) / 2))
        progress.setAttribute('stroke-width', String(RING_OUTER - hole))
      },
    })

    return () => {
      riseTrigger.kill()
      trigger.kill()
      qualities.style.zIndex = ''
      qualities.style.borderBottomLeftRadius = ''
      qualities.style.borderBottomRightRadius = ''
      circleWrap.style.opacity = ''
      leftTitle.style.transform = ''
      rightTitle.style.transform = ''
      progress.style.strokeDashoffset = ''
      progress.setAttribute('r', String(RING_RADIUS))
      progress.setAttribute('stroke-width', String(RING_STROKE_RESTING))
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Above-pin-wrap relative"
      style={{ height: `${(2 + TOTAL_PIN_VH) * 100}vh`, marginTop: '-100vh' }}
    >
      <section
        id="above"
        ref={sectionRef}
        className="Above sticky top-0 flex h-dvh items-center overflow-hidden"
      >
        <img
          src={aboveBg}
          alt="Aerial view of a woman in a white dress standing on a cliff above the ocean"
          className="absolute inset-0 size-full object-cover object-center lg:object-[50%_68%]"
          loading="lazy"
        />

        <div className="Above-pin relative z-1 flex w-full items-center justify-between px-2.5 lg:justify-center lg:gap-21.25 lg:px-5">
          <div className="Above-left flex shrink-0 items-center overflow-hidden">
            <p
              ref={leftTitleRef}
              className="[word-break:break-word] whitespace-nowrap font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-light md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]"
            >
              Above
              <br />
              the ocean
            </p>
          </div>

          <div
            ref={circleWrapRef}
            className="Above-circle-wrap absolute top-1/2 left-1/2 z-[-1] size-75 -translate-x-1/2 -translate-y-1/2 md:size-125 lg:static lg:z-auto lg:size-150 lg:translate-x-0 lg:translate-y-0"
          >
            <svg viewBox="0 0 100 100" className="size-full" fill="none">
              <circle
                cx="50"
                cy="50"
                r={RING_RADIUS}
                strokeWidth={RING_STROKE_RESTING}
                className="stroke-light/10"
              />
              <circle
                ref={progressRef}
                cx="50"
                cy="50"
                r={RING_RADIUS}
                strokeWidth={RING_STROKE_RESTING}
                className="stroke-light"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>

          <div className="Above-right flex shrink-0 items-center justify-end overflow-hidden">
            <p
              ref={rightTitleRef}
              className="[word-break:break-word] whitespace-nowrap text-right font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-light md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]"
            >
              Above
              <br />
              the world
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
