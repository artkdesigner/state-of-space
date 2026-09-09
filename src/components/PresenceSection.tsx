import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import presence1 from '../assets/presence-1.webp'
import presence2 from '../assets/presence-2.webp'
import presence3 from '../assets/presence-3.webp'
import presence4 from '../assets/presence-4.webp'
import presence5 from '../assets/presence-5.webp'
import presence6 from '../assets/presence-6.webp'
import presence7 from '../assets/presence-7.webp'
import Button from './Button'

type PresenceSectionProps = {
  onBookNow: () => void
}

const IMAGE_RADIUS =
  'overflow-hidden rounded-[0.375rem] md:rounded-[0.75rem] lg:rounded-[1.875rem]'

const SLOT_XL = 'w-24 shrink-0 md:w-48 lg:shrink lg:grow lg:basis-0'
const SLOT_L = SLOT_XL
const SLOT_S = SLOT_XL

/** Скролл-дистанция наезда Presence на Capacity (см. риск-комментарий у
 * riseTrigger ниже), в высотах вьюпорта. */
const RISE_VH = 1
/** Скролл-дистанция собственного reveal Presence (картинки сходятся к
 * финальным позициям; Presence-img-wrap статичен, см. WAVE ниже), уже
 * после того как Presence целиком закрыла Capacity, в высотах вьюпорта. */
const PRESENCE_PIN_VH = 2

/** Стартовое смещение картинок — за нижней границей экрана. Секция сама
 * `h-dvh` (не выше одного вьюпорта), поэтому +100vh от ЛЮБОЙ стартовой
 * позиции внутри неё гарантированно уводит картинку целиком за нижний
 * край, независимо от того, где в разметке она изначально стоит. */
const OFFSCREEN_VH = 100

/** Скролл-дистанция, за которую картинки внутри Presence-img-wrap
 * доезжают от нижнего выравнивания (штатное `items-end`, разная высота —
 * "skyline") до верхнего, пока сама Presence уходит — естественно
 * отклеивается от sticky и уезжает вверх обычным document flow сразу
 * после revealTrigger (см. leaveTrigger ниже). Секция `h-dvh`, поэтому
 * ей нужен ровно 1 вьюпорт скролла, чтобы полностью уйти за верхний край
 * — по просьбе пользователя. */
const LEAVE_VH = 1

/** Порядок появления — от центра наружу (сперва средняя картинка, потом
 * пара по бокам от неё, и так далее): индекс — позиция в ряду (0 =
 * Presence-img-xl … 6 = Presence-img-xl2, см. JSX), значение — номер
 * группы (0 появляется первой). */
const IMAGE_GROUP = [3, 2, 1, 0, 1, 2, 3]
const IMAGE_GROUP_COUNT = 4
/** Ширина окна каждой группы (0..1 прогресса reveal) и шаг между
 * стартами соседних групп, подобранный так, чтобы окно последней группы
 * заканчивалось ровно на 1 — тот же приём каскада с нахлёстом, что у
 * TITLE_WINDOW/LOGO_WINDOW в IntroSection.tsx. Окно намеренно большое
 * (почти вся дистанция reveal) — это даёт минимальный шаг между стартами
 * групп (см. IMAGE_GROUP_STEP), т.е. почти одновременное появление с
 * едва заметным каскадом от центра наружу, по прямому запросу
 * пользователя "минимальная задержка между картинками". */
const IMAGE_GROUP_WINDOW = 0.85
const IMAGE_GROUP_STEP = (1 - IMAGE_GROUP_WINDOW) / (IMAGE_GROUP_COUNT - 1)

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const windowProgress = (p: number, start: number, end: number) =>
  clamp((p - start) / (end - start))

export default function PresenceSection({ onBookNow }: PresenceSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const xlRef = useRef<HTMLDivElement>(null)
  const lRef = useRef<HTMLDivElement>(null)
  const mSlotRef = useRef<HTMLDivElement>(null)
  const sRef = useRef<HTMLDivElement>(null)
  const m2Ref = useRef<HTMLDivElement>(null)
  const l2Ref = useRef<HTMLDivElement>(null)
  const xl2Ref = useRef<HTMLDivElement>(null)

  /* Наезд Capacity → Presence (см. покадровую сцену в Figma «Capacity to
   * Presence» 1..6). Presence — `position: sticky; top: 0` внутри обёртки
   * Presence-pin-wrap высотой (1 + PRESENCE_PIN_VH) вьюпортов, сдвинутой
   * на `margin-top: -100vh` — тот же приём, что у Location1-pin-wrap/
   * Cliff-pin-wrap/Above-pin-wrap/Capacity-pin-wrap (см.
   * Location1Section.tsx и далее по цепочке): margin утягивает
   * документный верх Presence-wrap ровно на 1 вьюпорт раньше, чем
   * закончился бы Capacity-wrap "по прямому потоку" — то есть ровно туда,
   * где начинается последний (замороженный) вьюпорт Capacity.
   * Естественный document flow въезжает Presence снизу вверх и полностью
   * закрывает Capacity под собой (Presence — выше z-index) — никакого JS
   * на саму позицию. `(1 + PRESENCE_PIN_VH)`, а не `(2 + …)`: после
   * Presence по цепочке никто не должен «наезжать» на неё — следующая
   * секция (Location2) просто идёт обычным потоком, freeze-вьюпорт не
   * нужен.
   *
   * Пока Presence так въезжает («наезд», RISE_VH вьюпорт — СТОЛЬКО же
   * физически проезжает сама Presence, пока отклеивается от нормального
   * потока и въезжает; см. тот же приём в CliffSection.tsx), Capacity-
   * overlay (см. CapacitySection.tsx) проявляется из opacity: 0 до 1 за
   * ПЕРВУЮ половину наезда — к моменту, когда Presence уже перекрыла
   * половину экрана, оверлей полностью непрозрачный (так в макете).
   * Presence-img-wrap при этом никогда не сдвигается — он стоит на своей
   * финальной (последний кадр раскадровки) позиции с самого начала,
   * двигаются только картинки внутри него.
   *
   * `wrapTop()` — абсолютная doc-flow позиция wrap (та же величина, что
   * резолвит 'top top'), устойчива к скроллу, пока ничего не пинит wrap —
   * тот же приём, что в IntroSection.tsx/Location1Section.tsx/
   * CliffSection.tsx/AboveSection.tsx/CapacitySection.tsx.
   *
   * Как только Presence целиком закрыла Capacity (wrapTop), включается её
   * собственная (reveal) фаза (revealTrigger, PRESENCE_PIN_VH вьюпортов,
   * пока Presence приклеена) — отдельные картинки подъезжают снизу
   * (изначально — за нижним краем экрана, OFFSCREEN_VH) к финальной
   * позиции (0 — т.е. к тому, что уже нарисовано в JSX по умолчанию) по
   * очереди, от центра ряда наружу — сперва средняя (Presence-img-s),
   * затем пара по бокам от неё, и так далее до крайних (см.
   * IMAGE_GROUP). */
  useEffect(() => {
    const wrap = wrapRef.current
    const imgWrap = imgWrapRef.current
    const capacity = document.getElementById('capacity')
    const overlay = capacity?.querySelector<HTMLElement>('.Capacity-overlay')
    const imageEls = [xlRef, lRef, mSlotRef, sRef, m2Ref, l2Ref, xl2Ref].map(
      (r) => r.current,
    )
    if (
      !wrap ||
      !imgWrap ||
      !capacity ||
      !overlay ||
      imageEls.some((el) => !el)
    ) {
      return
    }
    if (reduceMotion()) return

    imageEls.forEach((el) => {
      el!.style.transform = `translateY(${OFFSCREEN_VH}vh)`
    })

    // Дельта "до верхнего выравнивания" на картинку — сколько px нужно
    // сдвинуть её вверх, чтобы её верх встал вровень с верхом
    // Presence-img-wrap (сейчас там только самая высокая, xl/xl2, за счёт
    // штатного items-end остальные короче и "висят" на общей нижней
    // границе). Меряем реальные высоты (imgWrap растёт по самой высокой
    // картинке), а не берём числа из Tailwind-классов — те breakpoint-
    // специфичны и по факту плавно скейлятся корневым rem (см. CLAUDE.md).
    const measureLeaveDeltas = () => {
      const wrapHeight = imgWrap.getBoundingClientRect().height
      return imageEls.map(
        (el) => -(wrapHeight - el!.getBoundingClientRect().height),
      )
    }
    let leaveDeltas = measureLeaveDeltas()
    const onResize = () => {
      leaveDeltas = measureLeaveDeltas()
    }
    window.addEventListener('resize', onResize)

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
        const t = self.progress
        overlay.style.opacity = String(clamp(t / 0.5))
      },
    })

    const revealTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: wrapTop,
      end: () => wrapTop() + window.innerHeight * PRESENCE_PIN_VH,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress

        imageEls.forEach((el, i) => {
          const start = IMAGE_GROUP[i] * IMAGE_GROUP_STEP
          const arrive = easeOutCubic(
            windowProgress(p, start, start + IMAGE_GROUP_WINDOW),
          )
          el!.style.transform = `translateY(${(1 - arrive) * OFFSCREEN_VH}vh)`
        })
      },
    })

    // Как только revealTrigger доиграл (картинки уже на штатных,
    // нижневыровненных местах) и Presence отклеивается от sticky и
    // естественным потоком уезжает вверх — картинки едут к верхнему
    // выравниванию (см. leaveDeltas выше), по просьбе пользователя.
    const leaveTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() + window.innerHeight * PRESENCE_PIN_VH,
      end: () =>
        wrapTop() + window.innerHeight * (PRESENCE_PIN_VH + LEAVE_VH),
      scrub: true,
      onUpdate: (self) => {
        const t = easeOutCubic(self.progress)
        imageEls.forEach((el, i) => {
          el!.style.transform = `translateY(${leaveDeltas[i] * t}px)`
        })
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      riseTrigger.kill()
      revealTrigger.kill()
      leaveTrigger.kill()
      overlay.style.opacity = ''
      imageEls.forEach((el) => {
        el!.style.transform = ''
      })
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Presence-pin-wrap relative z-[48]"
      style={{
        height: `${(1 + PRESENCE_PIN_VH) * 100}vh`,
        marginTop: '-100vh',
      }}
    >
      <section
        id="presence"
        ref={sectionRef}
        className="Presence sticky top-0 flex h-dvh flex-col items-center justify-between overflow-hidden bg-light px-2.5 pt-60 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
      >
        <div className="Presence-title-wrap flex w-full flex-col items-center justify-center gap-4 md:gap-5 lg:gap-10">
          <h2 className="Presence-title text-center font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.04em] text-dark md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]">
            Enter the Space of
            <br />
            Presence
          </h2>

          <div className="Presence-sub-wrap flex flex-col items-center gap-4 md:gap-5">
            <p className="Presence-sub w-[16.375rem] text-center font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] text-dark md:w-100">
              The Cliff Villa is a private, location-based experience shaped by
              architecture, landscape, and silence.
            </p>
            <Button onClick={onBookNow}>Request Access</Button>
          </div>
        </div>

        <div
          ref={imgWrapRef}
          className="Presence-img-wrap flex w-full items-end justify-center gap-[0.3125rem] md:gap-2.5 lg:gap-5"
        >
          <div
            ref={xlRef}
            className={`Presence-img-xl h-[7.625rem] md:h-61 lg:h-80 ${SLOT_XL} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence1}
              alt="Circular skylight above a minimalist dark-wood living room"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            ref={lRef}
            className={`Presence-img-l h-[6.4375rem] md:h-[12.875rem] lg:h-[16.875rem] ${SLOT_L} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence2}
              alt="Woman relaxing in an infinity pool overlooking the ocean at sunset"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            ref={mSlotRef}
            className="Presence-img-m-slot flex w-24 shrink-0 items-center justify-center md:w-48 lg:shrink lg:grow lg:basis-0"
          >
            <div className="-scale-y-100 w-full rotate-180">
              <div
                className={`Presence-img-m h-[4.8125rem] w-full md:h-[9.5625rem] lg:h-50 ${IMAGE_RADIUS}`}
              >
                <img
                  src={presence3}
                  alt="Living room sofa framing an ocean cliff view through sliding glass doors"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div
            ref={sRef}
            className={`Presence-img-s h-[4.3125rem] md:h-[8.625rem] lg:h-45 ${SLOT_S} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence4}
              alt="Living room with a full glass wall overlooking the coastline"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            ref={m2Ref}
            className={`Presence-img-m2 h-[4.8125rem] md:h-[9.5625rem] lg:h-50 ${SLOT_XL} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence5}
              alt="Curved-wall lounge with a round table overlooking the ocean"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            ref={l2Ref}
            className={`Presence-img-l2 h-[6.4375rem] md:h-[12.875rem] lg:h-[16.875rem] ${SLOT_L} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence6}
              alt="Living room sofas lit by warm afternoon shadow patterns"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div
            ref={xl2Ref}
            className={`Presence-img-xl2 h-[7.625rem] md:h-61 lg:h-80 ${SLOT_XL} ${IMAGE_RADIUS}`}
          >
            <img
              src={presence7}
              alt="Concrete facade detail with a desert plant in front of a small window"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
