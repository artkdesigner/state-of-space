import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import aboveBg from '../assets/above-bg.webp'

const RING_RADIUS = 47.5
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** Скролл-дистанция наезда Qualities на Above, в высотах вьюпорта.
 * ДОЛЖНА быть равна 1 — margin-top у Above на этой фазе гасит ровно один
 * вьюпорт её собственного естественного сноса при скролле (см. комментарий
 * у recedeStart/recedeEnd ниже); при другом значении Above перестанет
 * визуально «стоять на месте» всю фазу. */
const RECEDE_VH = 1
/** Скролл-дистанция внутренней хореографии Above, в высотах вьюпорта. */
const REVEAL_VH = 3

/** Доля фазы reveal, за которую Above-circle-wrap успевает проявиться из
 * прозрачности (см. покадровую сцену в Figma — заметно опережает оба
 * заголовка). */
const WRAP_FADE_FRACTION = 0.15
/** Above-left-title выезжает первым, сразу как проявился circle-wrap. */
const LEFT_TITLE_START = WRAP_FADE_FRACTION
const LEFT_TITLE_END = 0.55
/** Above-right-title начинает свой выезд только когда left-title уже
 * долистал до конца (в Figma right остаётся за кадром, пока left не
 * встал на место) и заканчивает ровно к концу фазы — одновременно с
 * заливкой кольца (см. ниже). */
const RIGHT_TITLE_START = LEFT_TITLE_END
const RIGHT_TITLE_END = 1

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function AboveSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)
  const leftTitleRef = useRef<HTMLParagraphElement>(null)
  const rightTitleRef = useRef<HTMLParagraphElement>(null)

  /* Переход Qualities → Above (см. покадровую сцену в Figma, "Qualities to
   * Above 1..8") — два отдельных триггера, а не один общий пин:
   *
   * 1) Наезд (recede, без pin): Qualities уходит вверх ОБЫЧНЫМ скроллом —
   *    никакой JS не трогает её позицию, только скругляет НИЖНИЕ углы по
   *    мере того, как она пропадает за верхней границей (зеркально тому,
   *    как распрямляется верхний край в IntroSection, но снизу, как в
   *    CliffSection). Above в это же время подтягивается через
   *    margin-top (-100vh → 0) — это НЕ «наезд поверх», а гашение
   *    собственного естественного сноса Above при скролле: на старте
   *    триггера Above без этой поправки уже сидела бы ровно на 1 vh ниже
   *    вьюпорта (ещё не подошла своим натуральным top к его верху), и
   *    margin -100vh мгновенно подтягивает её на видимое место; далее
   *    каждый px скролла одинаково поднимает и её натуральную позицию,
   *    и (за счёт уменьшения |margin| к 0) margin-поправку, так что
   *    сумма остаётся нулевой и Above визуально «стоит на месте» всю
   *    фазу — тот же приём, что Location1Section применяет к Cliff.
   *    Qualities всё это время рисуется НАД Above за счёт z-index — при
   *    их position:relative без него Above (позже в DOM) перекрыла бы
   *    Qualities по умолчанию.
   * 2) Раскрытие (pin: true, самопин Above): circle-wrap проявляется из
   *    прозрачности, следом выезжает наверх внутри своего контейнера
   *    Above-left-title, а следом за ним — только когда left-title уже
   *    встал на место — Above-right-title. Параллельно с самого начала
   *    фазы растёт заливка кольца (Above-circle-filled), финиширующая
   *    ровно к тому же моменту, что и right-title.
   *
   * `recedeStart` — эквивалент маркера 'bottom bottom' (нижний край
   * Qualities поравнялся с нижним краем вьюпорта) через
   * getBoundingClientRect, а не строковый маркер и не готовая абсолютная
   * формула из HERO_PIN_VH и соседей: суммарная высота, которую реально
   * добавляют в документ предыдущие пины (Hero/Intro/Location1/Cliff),
   * не постоянна — при самом первом посещении страницы (ещё ни один pin
   * не «отработал») она больше на 3 вьюпорта, чем после того, как
   * пользователь реально проскроллил их все хотя бы раз (проверено
   * эмпирически — GSAP схлопывает pin-spacer'ы предыдущих шагов после
   * первого прохода). Готовую формулу пришлось бы держать в двух
   * вариантах и знать, какой из них сейчас актуален; getBoundingClientRect
   * всегда отражает то, что реально отрисовано прямо сейчас. Qualities —
   * безопасный источник для этого: её геометрию не трогает ничей
   * margin-трюк, только косметический border-radius.
   * `revealTrigger.start = () => recedeTrigger.end` — второй пин обязан
   * начинаться РОВНО там, где заканчивается первый: GSAP заякоривает pin
   * по фактической (уже скорректированной margin-трюком) позиции элемента
   * в момент старта, и любое отклонение от неё даёт неверный `top` у
   * запиненного элемента (проверено эмпирически на первой версии этого
   * файла — Above пинилась на экран ниже нужного).
   */
  useEffect(() => {
    const section = sectionRef.current
    const qualities = document.getElementById('qualities')
    const wrap = wrapRef.current
    const progress = progressRef.current
    const leftTitle = leftTitleRef.current
    const rightTitle = rightTitleRef.current
    if (
      !section ||
      !qualities ||
      !wrap ||
      !progress ||
      !leftTitle ||
      !rightTitle
    ) {
      return
    }
    if (reduceMotion()) return

    qualities.style.zIndex = '47'

    // Стартовое (скрытое) состояние фазы 2 — выставляем сразу, а не ждём
    // первого onUpdate у revealTrigger: пока прогресс ровно 0, GSAP его не
    // вызывает, и до реального начала фазы элементы иначе на мгновение
    // показывались бы в дефолтном (полностью раскрытом) виде — заметно на
    // последних кадрах фазы 1, когда Above уже видна из-под Qualities, но
    // reveal ещё не начался.
    wrap.style.opacity = '0'
    leftTitle.style.transform = 'translateY(100%)'
    rightTitle.style.transform = 'translateY(100%)'
    progress.style.strokeDashoffset = String(RING_CIRCUMFERENCE)

    const recedeStart = () => {
      const r = qualities.getBoundingClientRect()
      return r.top + r.height - window.innerHeight + window.scrollY
    }

    const recedeTrigger = ScrollTrigger.create({
      trigger: qualities,
      start: recedeStart,
      end: () => `+=${window.innerHeight * RECEDE_VH}`,
      scrub: true,
      onUpdate: (self) => {
        const t = easeOutCubic(self.progress)
        section.style.marginTop = `${-(1 - t) * 100}vh`
        const radius = t * 45
        qualities.style.borderBottomLeftRadius = `${radius}vw`
        qualities.style.borderBottomRightRadius = `${radius}vw`
      },
    })

    const revealTrigger = ScrollTrigger.create({
      trigger: section,
      start: () => recedeTrigger.end,
      end: () => recedeTrigger.end + window.innerHeight * REVEAL_VH,
      pin: true,
      scrub: true,
      onLeave: () => ScrollTrigger.refresh(),
      onUpdate: (self) => {
        const reveal = self.progress

        wrap.style.opacity = String(clamp(reveal / WRAP_FADE_FRACTION))

        const leftEase = easeOutCubic(
          clamp(
            (reveal - LEFT_TITLE_START) / (LEFT_TITLE_END - LEFT_TITLE_START),
          ),
        )
        leftTitle.style.transform = `translateY(${(1 - leftEase) * 100}%)`

        const rightEase = easeOutCubic(
          clamp(
            (reveal - RIGHT_TITLE_START) /
              (RIGHT_TITLE_END - RIGHT_TITLE_START),
          ),
        )
        rightTitle.style.transform = `translateY(${(1 - rightEase) * 100}%)`

        const ringEase = easeOutCubic(reveal)
        progress.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - ringEase),
        )
      },
    })

    return () => {
      recedeTrigger.kill()
      revealTrigger.kill()
      qualities.style.zIndex = ''
      qualities.style.borderBottomLeftRadius = ''
      qualities.style.borderBottomRightRadius = ''
      section.style.marginTop = ''
      wrap.style.opacity = ''
      leftTitle.style.transform = ''
      rightTitle.style.transform = ''
      progress.style.strokeDashoffset = ''
    }
  }, [])

  return (
    <section
      id="above"
      ref={sectionRef}
      className="Above relative flex min-h-dvh items-center overflow-hidden"
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
          ref={wrapRef}
          className="Above-circle-wrap absolute top-1/2 left-1/2 z-[-1] size-75 -translate-x-1/2 -translate-y-1/2 md:size-125 lg:static lg:z-auto lg:size-150 lg:translate-x-0 lg:translate-y-0"
        >
          <svg viewBox="0 0 100 100" className="size-full" fill="none">
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              strokeWidth="5"
              className="stroke-light/10"
            />
            <circle
              ref={progressRef}
              cx="50"
              cy="50"
              r={RING_RADIUS}
              strokeWidth="5"
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
  )
}
