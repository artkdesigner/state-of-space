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
/** Скролл-дистанция собственного reveal Presence (Presence-img-wrap
 * доезжает + картинки сходятся к финальным позициям), уже после того как
 * Presence целиком закрыла Capacity, в высотах вьюпорта. */
const PRESENCE_PIN_VH = 2

/** Стартовое смещение Presence-img-wrap — % от ЕЁ ЖЕ высоты (та же
 * высота, что у самого высокого слота, Presence-img-xl), не px: так оно
 * само масштабируется на каждом брейкпоинте вместе с реальной высотой
 * враппера, а не только на Desktop-макете, откуда оно взято (см.
 * покадровую сцену в Figma «Capacity to Presence» 1..6 — там это
 * 400/320 = 125% высоты враппера на кадре 1920×1080). */
const WRAP_WAVE_PERCENT = 125

/** Стартовые смещения отдельных картинок — тоже % от СОБСТВЕННОЙ высоты
 * каждого слота (не от высоты враппера), тем же приёмом: в Figma
 * картинки начинают в «дугой» раскладке (крайние выше своей финальной
 * точки, средние — чуть ниже), а сходятся к плоскому ряду, как в текущей
 * (уже готовой) вёрстке ниже. Считано из разницы координат кадра 1
 * («дуга») и кадра 6 («плоский ряд», = текущая вёрстка), делённой на
 * собственную высоту слота: xl (248-0)/320, l (200-50)/270,
 * m (100-120)/200, s (0-140)/180. */
const WAVE = { xl: 77.5, l: 55.56, m: -10, s: -77.78 }
const IMAGE_WAVE_ORDER = [WAVE.xl, WAVE.l, WAVE.m, WAVE.s, WAVE.m, WAVE.l, WAVE.xl]

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export default function PresenceSection({ onBookNow }: PresenceSectionProps) {
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
   * Presence» 1..6). Presence сама — обычный блочный `<section>`, без
   * `position: sticky`: её сдвигает вверх статический (заданный один раз
   * в CSS, см. className/style ниже) `margin-top: -100vh` — тот же приём,
   * что подтягивает Intro во время Hero и Location1 во время Intro (см.
   * HeroSection.tsx/IntroSection.tsx/Location1Section.tsx/scrollChain.ts):
   * Capacity держит себя приклеенной на 1 лишний вьюпорт сверх своего
   * роста (CAPACITY_FREEZE_VH, см. AboveSection.tsx), Presence подтянута
   * на этот же вьюпорт margin'ом — естественный document flow въезжает
   * Presence снизу вверх ровно в тот момент, когда рост Capacity
   * закончился, и полностью закрывает её (Presence — выше z-index).
   *
   * Пока Presence так въезжает («наезд», RISE_VH вьюпортов, БЕЗ пина —
   * это просто обычный скролл), два JS-эффекта следят за тем же самым
   * прогрессом:
   * 1) Capacity-overlay (см. CapacitySection.tsx) проявляется из
   *    opacity: 0 до 1 за ПЕРВУЮ половину наезда — к моменту, когда
   *    Presence уже перекрыла половину экрана, оверлей полностью
   *    непрозрачный (так в макете).
   * 2) Presence-img-wrap (изначально — в WRAP_WAVE_PERCENT% ниже своей
   *    цели) начинает подъезжать к цели только во ВТОРУЮ половину наезда
   *    — до этого стоит на месте (см. те же кадры в Figma: враппер не
   *    сдвигается, пока Capacity ещё не наполовину перекрыта).
   *
   * `riseCompleteStart` — натуральная (уже с учётом margin-top: -100vh)
   * верхняя граница Presence в document flow, ДО того как её схватит
   * собственный self-pin ниже — тот же приём, что recedeStart в
   * AboveSection.tsx: getBoundingClientRect + текущий scrollY даёт
   * устойчивую абсолютную page-координату элемента, пока он ещё в обычном
   * потоке (позиция инвариантна к скроллу, пока ничего не пинит
   * элемент — так что не важно, в какой момент функция реально
   * вызовется).
   *
   * Как только Presence целиком закрыла Capacity (riseCompleteStart),
   * включается её собственный self-pin (revealTrigger, PRESENCE_PIN_VH
   * вьюпортов, pin: true — та же механика, что у capacityTrigger в
   * AboveSection.tsx, а не CSS sticky: Capacity в этой части цепочки уже
   * на GSAP pin:true, а не на sticky, и Presence продолжает тем же
   * идиомом) — и уже ВНУТРИ него, строго последовательно (не
   * одновременно — см. текстовое ТЗ):
   * a) первая половина — Presence-img-wrap доезжает от своего
   *    промежуточного положения (после наезда) до 0 (целевая координата);
   * b) вторая половина — только когда враппер уже доехал, отдельные
   *    картинки сходятся из «дугой» раскладки (WAVE) к финальной плоской
   *    (0 — т.е. к тому, что уже нарисовано в JSX по умолчанию). */
  useEffect(() => {
    const presence = sectionRef.current
    const imgWrap = imgWrapRef.current
    const capacity = document.getElementById('capacity')
    const overlay = capacity?.querySelector<HTMLElement>('.Capacity-overlay')
    const imageEls = [xlRef, lRef, mSlotRef, sRef, m2Ref, l2Ref, xl2Ref].map(
      (r) => r.current,
    )
    if (
      !presence ||
      !imgWrap ||
      !capacity ||
      !overlay ||
      imageEls.some((el) => !el)
    ) {
      return
    }
    if (reduceMotion()) return

    imgWrap.style.transform = `translateY(${WRAP_WAVE_PERCENT}%)`
    imageEls.forEach((el, i) => {
      el!.style.transform = `translateY(${IMAGE_WAVE_ORDER[i]}%)`
    })

    const riseCompleteStart = () => {
      const r = presence.getBoundingClientRect()
      return r.top + window.scrollY
    }
    const riseStart = () => riseCompleteStart() - window.innerHeight * RISE_VH

    const riseTrigger = ScrollTrigger.create({
      trigger: presence,
      start: riseStart,
      end: () => riseStart() + window.innerHeight * RISE_VH,
      scrub: true,
      onUpdate: (self) => {
        const t = self.progress
        overlay.style.opacity = String(clamp(t / 0.5))
        const wrapT =
          t < 0.5
            ? WRAP_WAVE_PERCENT
            : WRAP_WAVE_PERCENT -
              ((t - 0.5) / 0.5) * (WRAP_WAVE_PERCENT / 2)
        imgWrap.style.transform = `translateY(${wrapT}%)`
      },
    })

    const revealTrigger = ScrollTrigger.create({
      trigger: presence,
      start: riseCompleteStart,
      end: () => riseCompleteStart() + window.innerHeight * PRESENCE_PIN_VH,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress

        const wrapPhase = clamp(p / 0.5)
        const wrapT = (WRAP_WAVE_PERCENT / 2) * (1 - wrapPhase)
        imgWrap.style.transform = `translateY(${wrapT}%)`

        const imagePhase = clamp((p - 0.5) / 0.5)
        imageEls.forEach((el, i) => {
          el!.style.transform = `translateY(${
            IMAGE_WAVE_ORDER[i] * (1 - imagePhase)
          }%)`
        })
      },
    })

    return () => {
      riseTrigger.kill()
      revealTrigger.kill()
      overlay.style.opacity = ''
      imgWrap.style.transform = ''
      imageEls.forEach((el) => {
        el!.style.transform = ''
      })
    }
  }, [])

  return (
    <section
      id="presence"
      ref={sectionRef}
      className="Presence relative z-[48] flex h-dvh flex-col items-center justify-between overflow-hidden bg-light px-2.5 pt-60 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
      style={{ marginTop: '-100vh' }}
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
  )
}
