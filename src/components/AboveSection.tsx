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

/** Первые RISE_VH вьюпорта СОБСТВЕННОЙ (уже приклеенной) sticky-фазы
 * Above — чистый запас: по структуре обёрток Qualities (обычный поток,
 * без sticky) в этот момент уже гарантированно дочитывает свой последний
 * вьюпорт и уезжает вверх сама, естественным document flow, без единой
 * строчки JS — Above просто ждёт этого, уже неподвижно приклеенная, и
 * только затем начинает собственное раскрытие (см. trigger ниже). Раньше
 * тут же скруглялись нижние углы Qualities синхронно с её отъездом —
 * анимацию убрали по просьбе пользователя, сам буфер (и структура
 * обёрток, задающая момент, когда Qualities отклеивается) остался. */
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
/** Должно совпадать с (GROW_VH + UNWIND_VH) в CapacitySection.tsx — её
 * riseTrigger растит круглую маску (от уже сплошного диска Above до
 * полного покрытия вьюпорта), но круг радиусом в половину ширины экрана
 * закрывает не весь прямоугольник вьюпорта — его УГЛЫ остаются непокрыты,
 * их закрывает только следующая фаза (trigger), где маска распрямляется
 * в прямоугольник (round 50% → 0%). Above должна оставаться неподвижно
 * приклеенной ВЕСЬ этот срок (обе фазы, не только рост), иначе в углах на
 * кадр-другой видно, как Above уже едет из-под ещё не полностью
 * распрямившейся маски (по просьбе пользователя: Above должна стоять на
 * месте, пока идёт вся анимация Capacity). */
const CAPACITY_GROW_VH = 3

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
 * `reveal` — `ringFill = reveal` напрямую, а сам `reveal` линеен (без
 * easeOutCubic, см. onUpdate ниже), иначе "заполнено на 50%" и "left
 * полностью виден" разъезжались бы (реальная синхронизация тогда была бы
 * не по факту, а по совпадению конкретных чисел easeOutCubic), а заливка
 * кольца тратила бы на первую половину меньше скролла, чем на вторую. */
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
   * (1 + RISE_VH + TOTAL_PIN_VH + CAPACITY_GROW_VH) вьюпортов, сдвинутой
   * на `margin-top: -100vh» — тот же приём, что у Location1-pin-wrap/
   * Cliff-pin-wrap (см. Location1Section.tsx/CliffSection.tsx). `+1` —
   * стандартный запас; `RISE_VH` — теперь СВОЙ бюджет Above (см.
   * константу выше, riseTrigger переехал на ПОСЛЕ wrapTop), а не
   * бесплатная фаза на чужом натуральном скролле, как было раньше;
   * `CAPACITY_GROW_VH` — тот же лишний запас, что и был: Above остаётся
   * приклеенной (уже полностью раскрытой, диск сплошной) ровно на всю
   * длительность роста маски Capacity, растущей ДО собственного wrapTop
   * Capacity (см. CapacitySection.tsx) — маска должна успеть ПОЛНОСТЬЮ
   * закрыть экран до того, как Above отклеится и сама начнёт естественным
   * потоком уезжать (иначе на кадр-другой видно её движение из-под ещё
   * маленькой маски). Сам центр этой маски теперь компенсирует
   * собственное движение Capacity, пока та ещё не приклеена (см.
   * CapacitySection.tsx) — раньше он был привязан к центру её же
   * (движущегося) бокса и на глаз "наезжал"/сползал, а не рос на месте
   * из уже неподвижного диска Above, как должно быть по макету.
   *
   * Первые RISE_VH вьюпорта собственной sticky-фазы (т.е. ПОСЛЕ wrapTop,
   * не до) — чистый запас, пока Qualities (обычный поток, без sticky)
   * сама уезжает вверх и пропадает за верхней границей, без анимации.
   * z-index Qualities поднят один раз при монтировании (не по кадрам) —
   * при их обычном position:relative без этого Above (позже в DOM)
   * перекрыла бы Qualities по умолчанию.
   *
   * trigger (TOTAL_PIN_VH вьюпортов сразу следом, Above уже приклеена) —
   * раскрытие + утолщение, см. onUpdate ниже. Остальные CAPACITY_GROW_VH
   * вьюпорта после этого — чистый запас: Above уже полностью раскрыта и
   * просто ждёт, пока Capacity дорастит маску (см. выше). */
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

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() + window.innerHeight * RISE_VH,
      end: () => wrapTop() + window.innerHeight * (RISE_VH + TOTAL_PIN_VH),
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress

        // Фаза 1 — раскрытие: единое (линейное, БЕЗ easing) время `reveal`
        // управляет и кольцом, и обоими заголовками. Линейность здесь
        // принципиальна для самого кольца — заливка должна тратить на
        // каждую половину (0→50% и 50%→100%) одинаковый скролл (по жалобе
        // пользователя: раньше `reveal` сам был eased, из-за чего первая
        // половина заливки съедала намного меньше скролла, чем вторая).
        // Кольцо = reveal напрямую (без дополнительного easing) — так
        // "заполнено на TITLE_HALFWAY" и "заголовок полностью виден/
        // спрятан" гарантированно совпадают по построению, а не по
        // случайному совпадению кривых. Заголовки не теряют смягчение
        // движения — каждый берёт свой собственный easeOutCubic ниже,
        // локально внутри своей половины `reveal`.
        const reveal = clamp(p / REVEAL_BOUNDARY)
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
      trigger.kill()
      qualities.style.zIndex = ''
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
      style={{
        height: `${(1 + RISE_VH + TOTAL_PIN_VH + CAPACITY_GROW_VH) * 100}vh`,
        marginTop: '-100vh',
      }}
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

        {/* lg:flex-1 на Above-left/Above-right (вместо shrink-0-по-контенту)
         * — "Above the ocean"/"Above the world" разной ширины, поэтому
         * `justify-center` центрировал всю группу как единый блок, а не
         * само кольцо: при разных по ширине соседях кольцо визуально
         * съезжало от центра экрана (баг, на который пожаловался
         * пользователь). Два равных flex-1 гарантируют, что кольцо стоит
         * ровно посередине независимо от длины текста; justify-end/-start
         * держат текст прижатым к кольцу на фиксированный `gap-21.25`, а
         * вся "лишняя" ширина уходит в невидимый отступ у внешнего края. */}
        <div className="Above-pin relative z-1 flex w-full items-center justify-between px-2.5 lg:justify-center lg:gap-21.25 lg:px-5">
          <div className="Above-left flex shrink-0 items-center overflow-hidden lg:flex-1 lg:justify-end">
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

          <div className="Above-right flex shrink-0 items-center justify-end overflow-hidden lg:flex-1 lg:justify-start">
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
