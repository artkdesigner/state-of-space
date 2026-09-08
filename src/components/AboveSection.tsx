import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import aboveBg from '../assets/above-bg.webp'

const RING_RADIUS = 47.5
/** Внешний край кольца — фиксирован всегда, толщина растёт только внутрь
 * (см. фазу thicken ниже). */
const RING_OUTER = RING_RADIUS + 2.5
/** Внутренний край кольца в состоянии покоя (толщина 5 — как в JSX). */
const RING_INNER_RESTING = RING_RADIUS - 2.5
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** Скролл-дистанция наезда Qualities на Above, в высотах вьюпорта.
 * ДОЛЖНА быть равна 1 — margin-top у Above на этой фазе гасит ровно один
 * вьюпорт её собственного естественного сноса при скролле (см. комментарий
 * у recedeStart/recedeEnd ниже); при другом значении Above перестанет
 * визуально «стоять на месте» всю фазу. */
const RECEDE_VH = 1
/** Скролл-дистанция раскрытия (фаза 1: circle-wrap/заголовки/заливка
 * кольца), в высотах вьюпорта. */
const REVEAL_VH = 3
/** Скролл-дистанция утолщения кольца в круг + скрытия заголовков (фаза 2),
 * в высотах вьюпорта. */
const THICKEN_VH = 2
/** Скролл-дистанция роста Above-circle-wrap (фаза 3, ещё внутри самопина
 * Above), в высотах вьюпорта. */
const ABOVE_DISK_GROW_VH = 1.5
/** Скролл-дистанция роста круглой маски Capacity + её opacity (отдельный
 * самопин Capacity, начинается сразу после самопина Above), в высотах
 * вьюпорта. */
const CAPACITY_GROW_VH = 3
/** Лишний вьюпорт поверх CAPACITY_GROW_VH, на который растянут пин
 * capacityTrigger (см. ниже) — тот же приём, что у Hero-wrap/Intro-wrap
 * (см. HeroSection.tsx/IntroSection.tsx/scrollChain.ts): держит Capacity
 * приклеенной (уже полностью выросшей) ещё на всю дистанцию, пока
 * Presence (см. PresenceSection.tsx, её статический `margin-top: -100vh`)
 * въезжает снизу и полностью её закрывает — настоящий cover-переход, а
 * не последовательная прокрутка. */
const CAPACITY_FREEZE_VH = 1
const TOTAL_REVEAL_VH = REVEAL_VH + THICKEN_VH + ABOVE_DISK_GROW_VH
/** Границы фаз 1/2/3 внутри общего прогресса самопина Above, 0..1. */
const REVEAL_BOUNDARY = REVEAL_VH / TOTAL_REVEAL_VH
const THICKEN_BOUNDARY = (REVEAL_VH + THICKEN_VH) / TOTAL_REVEAL_VH

/** Доля фазы 1, за которую Above-circle-wrap успевает проявиться из
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

/** Above-left-title прячется вверх первым — первая половина фазы 2. */
const LEFT_HIDE_END = 0.5
/** Above-right-title начинает прятаться только когда left уже скрылся, и
 * заканчивает ровно к концу фазы 2 — тогда же кольцо должно стать кругом
 * (см. Figma: "Above to Capacity" 1..4). */
const RIGHT_HIDE_START = LEFT_HIDE_END

const ABOVE_GROW_SCALE = 1.8

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t: number) => t * t * t

export default function AboveSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const circleScaleRef = useRef<HTMLDivElement>(null)
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
   * 2) Самопин Above на три внутренние фазы (см. покадровую сцену в Figma,
   *    "Above to Capacity" 1..7):
   *    a) Раскрытие (REVEAL_VH) — circle-wrap проявляется из прозрачности,
   *       следом выезжает наверх внутри своего контейнера
   *       Above-left-title, а следом за ним — только когда left-title уже
   *       встал на место — Above-right-title. Параллельно с самого начала
   *       фазы растёт заливка кольца (Above-circle-filled), финиширующая
   *       ровно к тому же моменту, что и right-title.
   *    b) Утолщение (THICKEN_VH) — Above-left-title уезжает вверх и
   *       прячется в своём контейнере (зеркально тому, как въезжал в фазе
   *       a), следом за ним, только когда left уже скрылся, — то же самое
   *       с Above-right-title. Кольцо всё это время утолщается внутрь
   *       (внешний край не двигается) и к моменту, когда скрылся правый
   *       заголовок, становится сплошным кругом.
   *    c) Рост диска (ABOVE_DISK_GROW_VH) — Above-circle-wrap (уже сплошной
   *       круг) подрастает и держит финальный размер до конца самопина.
   * 3) Отдельный самопин Capacity (capacityTrigger), сразу вслед за
   *    предыдущим: растёт круглая маска (clip-path) от 0 до 100vw в
   *    диаметре с одновременным ростом opacity от 0 до 1 — визуально
   *    прямое продолжение растущего диска Above-circle-wrap (тот же
   *    центр, тот же цвет). Самопин, а не гашение margin, как у Above в
   *    фазе наезда: тут это гораздо безопаснее — постоянная компенсирующая
   *    margin, достаточно большая (несколько вьюпортов, пока маска растёт),
   *    временно рвёт карту скролла всех триггеров ниже по странице
   *    (проверено эмпирически — секция снизу «прыгала» на совершенно
   *    другую позицию). Самопин просто держит Capacity на месте средствами
   *    GSAP, без ручной арифметики.
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
    const capacity = document.getElementById('capacity')
    const wrap = wrapRef.current
    const circleScale = circleScaleRef.current
    const progress = progressRef.current
    const leftTitle = leftTitleRef.current
    const rightTitle = rightTitleRef.current
    if (
      !section ||
      !qualities ||
      !capacity ||
      !wrap ||
      !circleScale ||
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
    capacity.style.opacity = '0'
    capacity.style.clipPath = 'circle(0px at 50% 50%)'

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
      end: () => recedeTrigger.end + window.innerHeight * TOTAL_REVEAL_VH,
      pin: true,
      scrub: true,
      onLeave: () => ScrollTrigger.refresh(),
      onUpdate: (self) => {
        const p = self.progress

        // Фаза a — раскрытие: circle-wrap проявляется, следом левый, потом
        // правый заголовок выезжают на место, кольцо заливается по кругу.
        const reveal = clamp(p / REVEAL_BOUNDARY)
        wrap.style.opacity = String(clamp(reveal / WRAP_FADE_FRACTION))

        const leftReveal = easeOutCubic(
          clamp(
            (reveal - LEFT_TITLE_START) / (LEFT_TITLE_END - LEFT_TITLE_START),
          ),
        )
        const rightReveal = easeOutCubic(
          clamp(
            (reveal - RIGHT_TITLE_START) /
              (RIGHT_TITLE_END - RIGHT_TITLE_START),
          ),
        )

        const ringFill = easeOutCubic(reveal)

        // Фаза b — утолщение: заголовки уезжают вверх и прячутся в
        // обратную сторону от того, как въезжали в фазе a (left первым,
        // right — только когда left уже скрылся), кольцо тем временем
        // утолщается внутрь (внешний край RING_OUTER не меняется) и к
        // концу фазы становится сплошным кругом.
        const thicken = clamp(
          (p - REVEAL_BOUNDARY) / (THICKEN_BOUNDARY - REVEAL_BOUNDARY),
        )
        const leftHide = easeOutCubic(clamp(thicken / LEFT_HIDE_END))
        const rightHide = easeOutCubic(
          clamp((thicken - RIGHT_HIDE_START) / (1 - RIGHT_HIDE_START)),
        )

        leftTitle.style.transform = `translateY(${
          p < REVEAL_BOUNDARY ? (1 - leftReveal) * 100 : -leftHide * 100
        }%)`
        rightTitle.style.transform = `translateY(${
          p < REVEAL_BOUNDARY ? (1 - rightReveal) * 100 : -rightHide * 100
        }%)`

        const hole = (1 - easeInCubic(thicken)) * RING_INNER_RESTING
        progress.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - ringFill),
        )
        progress.setAttribute('r', String((RING_OUTER + hole) / 2))
        progress.setAttribute('stroke-width', String(RING_OUTER - hole))

        // Фаза c — рост диска: Above-circle-wrap (уже сплошной круг)
        // подрастает и держит финальный размер до конца самопина.
        const grow = clamp((p - THICKEN_BOUNDARY) / (1 - THICKEN_BOUNDARY))
        const aboveGrowEase = easeOutCubic(grow)
        circleScale.style.transform = `scale(${
          1 + aboveGrowEase * (ABOVE_GROW_SCALE - 1)
        })`
      },
    })

    // Мостик ровно в 1 вьюпорт: как только самопин Above заканчивается
    // (revealTrigger.end), она возвращается в обычный поток и занимает
    // ровно 1 вьюпорт (см. комментарий выше и в scrollChain.ts — каждая
    // пинящаяся секция добавляет в документ и высоту, и длительность
    // пина) — Capacity в этот момент натурально ещё на 1 вьюпорт ниже
    // сгиба. Без этого мостика между самопинами Above и Capacity был бы
    // пустой пробел в 1 вьюпорт обычного скролла (проверено эмпирически —
    // страница на секунду становится пустой). Гасим этот снос margin'ом
    // (0 → -100vh → 0, тот же приём, что и recedeTrigger выше) — Capacity
    // всё это время невидима (opacity ещё 0, растить маску начнёт только
    // capacityTrigger ниже), так что не имеет значения, что Above (обычный
    // поток, без пина) в это время просто нормально уезжает вверх поверх
    // неё — снаружи это не видно.
    const bridgeTrigger = ScrollTrigger.create({
      trigger: section,
      start: () => revealTrigger.end,
      end: () => revealTrigger.end + window.innerHeight,
      scrub: true,
      onUpdate: (self) => {
        const t = easeOutCubic(self.progress)
        capacity.style.marginTop = `${-(1 - t) * 100}vh`
      },
    })

    // Above-circle-wrap уже подрос (фаза c выше) — Capacity подхватывает
    // рост визуально с того же места: растущая маска (clip-path) от 0 до
    // 100vw + одновременный рост opacity от 0 до 1. Самопин стартует РОВНО
    // там, где заканчивается мостик — её истинная натуральная позиция
    // (margin к этому моменту уже погашен до 0), и только на ней GSAP
    // корректно заякорит pin на top:0 (проверено эмпирически). Пин длится
    // (CAPACITY_GROW_VH + CAPACITY_FREEZE_VH) вьюпортов, а не просто
    // CAPACITY_GROW_VH: сам рост (opacity/clip-path) доигрывает и
    // замирает на 100% ровно к концу CAPACITY_GROW_VH (см. пересчёт
    // прогресса в onUpdate), а последний CAPACITY_FREEZE_VH держит
    // Capacity приклеенной уже полностью выросшей — именно в это время
    // Presence (см. PresenceSection.tsx) наезжает поверх нее снизу и
    // закрывает её. Без onLeave-refresh(): PresenceSection ниже вычисляет
    // свою стартовую позицию через getBoundingClientRect (см. её
    // riseCompleteStart, тот же приём, что recedeStart выше в этом
    // файле) — ScrollTrigger.refresh() ровно в момент, когда Capacity
    // отпускает пин, мог бы сам подвинуть scroll(), чтобы сохранить
    // прогресс какого-то другого активного пина (см. подробный разбор
    // этого класса багов в scrollChain.ts и памяти проекта), а Presence в
    // этот самый момент как раз должна начинать собственный самопин —
    // слишком рискованная точка для лишнего пересчёта.
    const capacityTrigger = ScrollTrigger.create({
      trigger: capacity,
      start: () => bridgeTrigger.end,
      end: () =>
        bridgeTrigger.end +
        window.innerHeight * (CAPACITY_GROW_VH + CAPACITY_FREEZE_VH),
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const grow = clamp(
          (self.progress * (CAPACITY_GROW_VH + CAPACITY_FREEZE_VH)) /
            CAPACITY_GROW_VH,
        )
        capacity.style.opacity = String(grow)
        const maskRadius = easeInCubic(grow) * (window.innerWidth / 2)
        capacity.style.clipPath = `circle(${maskRadius}px at 50% 50%)`
      },
    })

    return () => {
      recedeTrigger.kill()
      revealTrigger.kill()
      bridgeTrigger.kill()
      capacityTrigger.kill()
      qualities.style.zIndex = ''
      qualities.style.borderBottomLeftRadius = ''
      qualities.style.borderBottomRightRadius = ''
      section.style.marginTop = ''
      wrap.style.opacity = ''
      leftTitle.style.transform = ''
      rightTitle.style.transform = ''
      progress.style.strokeDashoffset = ''
      progress.setAttribute('r', String(RING_RADIUS))
      progress.setAttribute('stroke-width', '5')
      circleScale.style.transform = ''
      capacity.style.marginTop = ''
      capacity.style.opacity = ''
      capacity.style.clipPath = ''
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
          {/* Обёртка под масштабирование (фаза роста) — отдельно от wrapRef,
              чтобы динамический transform:scale не конфликтовал со
              статическими translate-классами адаптивного центрирования
              выше. */}
          <div ref={circleScaleRef} className="size-full">
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
