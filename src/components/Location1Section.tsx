import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import { scrollToY } from '../lib/scroll'
import baseImg from '../assets/location1-slider-base.webp'
import slide1 from '../assets/location1-slide-1.webp'
import slide2 from '../assets/location1-slide-2.webp'
import slide3 from '../assets/location1-slide-3.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Cliff Villa terrace and infinity pool at sunset, framed by the concrete and timber roofline',
  },
  {
    src: slide2,
    alt: 'The Cliff Villa seen against the mountain, with the pool reflecting the sunset sky',
  },
  {
    src: slide3,
    alt: 'The Cliff Villa perched above the ocean, mountain cliffs rising behind it',
  },
]

/** Число слайдов = собственная (reveal) фаза Location1, в высотах
 * вьюпорта, пока секция приклеена вверху — ровно 1 экран высоты скролла
 * на слайд, тот же принцип, что PIN_VH в HeroSection/IntroSection.tsx (см.
 * src/lib/scrollChain.ts — общий источник для их PIN_VH, здесь он не
 * нужен, т.к. дальше по цепочке никто не берёт готовую формулу позиции
 * Location1, а сам naезд Cliff считает свою позицию через
 * getBoundingClientRect, см. CliffSection.tsx). */
const SLIDE_COUNT = 3
const PIN_VH = SLIDE_COUNT
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28
/** Прогресс (0..1 в старом, PIN_VH-широком отсчёте), на котором долистывает
 * последний кроссфейд (переход в SLIDE_COUNT-й, финальный слайд) — тот же
 * `to` из цикла в trigger.onUpdate ниже, для последней (i = SLIDE_COUNT-2)
 * границы. После него в старом отсчёте оставался «мёртвый» хвост скролла
 * без единого изменения на экране (пользователь пожаловался на лишнее
 * расстояние после 3-го слайда) — ACTIVE_VH ниже обрезает именно этот
 * хвост. */
const LAST_CROSSFADE_END =
  (SLIDE_COUNT - 1) / SLIDE_COUNT + CROSSFADE / 2
/** Реальная длина активной (слайдерной) фазы секции, в вьюпортах — короче
 * PIN_VH ровно на величину мёртвого хвоста. Используется для высоты
 * pin-wrap и конца scroll-trigger'а вместо PIN_VH; сам PIN_VH остаётся
 * "виртуальным" знаменателем (ровно 1 экран на слайд) для формул границ
 * ниже — так темп первых кроссфейдов не меняется, срезается только
 * лишний хвост. */
const ACTIVE_VH = PIN_VH * LAST_CROSSFADE_END
/** Доля прогресса, за которую Location-карточка успевает проявиться из
 * прозрачности после того, как секция встала на место. */
const CARD_FADE_IN = 0.2

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location1SectionProps = {
  onBookNow: () => void
}

export default function Location1Section({ onBookNow }: Location1SectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  /** Клик по Location-step (см. LocationCard.tsx) — скроллит к середине
   * "виртуального" (PIN_VH-широкого, см. константы вверху файла) окна
   * нужного слайда, т.е. туда, где он уже полностью проявлен и ещё не
   * начал гаснуть в следующий кроссфейд. `PIN_VH === SLIDE_COUNT` (1 экран
   * на слайд), поэтому середина окна слайда i — ровно `(i + 0.5)` вьюпорта
   * от wrapTop; clamp на ACTIVE_VH — та же укороченная (без мёртвого
   * хвоста после последнего кроссфейда, см. LAST_CROSSFADE_END выше)
   * дистанция, на которую физически заведён trigger ниже. */
  const handleStepClick = (index: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const wrapDocTop = wrap.getBoundingClientRect().top + window.scrollY
    const target = gsap.utils.clamp(
      0,
      window.innerHeight * ACTIVE_VH,
      (index + 0.5) * window.innerHeight,
    )
    scrollToY(wrapDocTop + target)
  }

  /* Скролл-переход Intro → Location1 → Cliff (см. покадровую сцену в
   * Figma). Location1 — `position: sticky; top: 0` внутри обёртки
   * Location1-pin-wrap высотой (2 + ACTIVE_VH) вьюпортов, сдвинутой на
   * `margin-top: -100vh` — тот же приём, что у Hero-pin-wrap/Intro-pin-wrap
   * (см. HeroSection.tsx/IntroSection.tsx): margin утягивает документный
   * верх Location1-wrap ровно на 1 вьюпорт раньше, чем закончился бы
   * Intro-pin-wrap "по прямому потоку" — то есть ровно туда, где
   * заканчивается собственная (PIN_VH-часть) анимация Intro, пока сама
   * Intro остаётся приклеенной ещё на 1 вьюпорт (см. IntroSection.tsx). За
   * счёт этого Location1 въезжает снизу вверх (её `top` от `100vh` до `0`,
   * обычный document flow, без единой строчки JS) и полностью закрывает
   * уже неподвижную Intro под собой — настоящий cover-переход, а не
   * последовательная прокрутка. `(2 + ACTIVE_VH)` вместо `(1 + ACTIVE_VH)` —
   * лишний вьюпорт держит Location1 приклеенной (уже полностью раскрытой)
   * ещё на всю дистанцию, пока Cliff (следующий сиблинг, подтянутый вверх
   * своим собственным `margin-top: -100vh`, см. CliffSection.tsx) сама
   * встаёт на sticky. С этого момента переход противоположный: Cliff
   * дальше стоит на месте (это её собственная sticky-фаза, см. RISE_VH в
   * CliffSection.tsx), а вот Location1, наоборот, тут же отклеивается и
   * естественным document flow уезжает вверх, открывая уже неподвижную
   * Cliff под собой — тот же приём margin-компенсации, что и выше, просто
   * в этот раз "закрывающая" сторона — предыдущая секция, а не следующая.
   * Никакого JS для самого отъезда — весь эффект даёт разница между
   * высотой Location1-wrap и margin-top на Cliff-wrap.
   *
   * `wrapTop()` — абсолютная doc-flow позиция wrap (та же величина, что
   * резолвит 'top top'), устойчива к скроллу, пока ничего не пинит wrap —
   * тот же приём, что в IntroSection.tsx/PresenceSection.tsx. Не строковый
   * маркер 'top top' и не готовая формула: на wrap уже стоит статический
   * `margin-top: -100vh`, и getBoundingClientRect отражает итоговую,
   * уже свёрнутую этим margin'ом позицию, какой бы она ни была.
   *
   * Пока идёт сам наезд (последний вьюпорт ПЕРЕД wrapTop, ещё до
   * приклеивания — см. riseTrigger ниже), Location-slider раскруглятся:
   * `border-radius` в `vmin`, не в `%` (та же правка, что в
   * QualitiesSection.tsx/CliffSection.tsx/Location2Section.tsx) — сама
   * Location-slider всегда ровно `100vw × 100dvh` (inset-0 в h-dvh
   * w-full секции), а на портретных mobile/tablet вьюпортах высота
   * заметно больше ширины; `%` считается отдельно по каждой оси и даёт
   * вытянутый эллипс вместо круглой дуги (жалоба пользователя — на
   * tablet скругление выглядело непропорционально). `vmin` — 1% от
   * МЕНЬШЕЙ стороны вьюпорта на обеих осях сразу, даёт настоящую дугу
   * окружности. На экране это выглядит как растущая снизу дуга —
   * линейно к border-radius: 0 ровно к моменту, когда наезд завершён (см.
   * покадровую сцену в Figma «Intro to Location1» 1..7). Location-карточка
   * (LocationCard) в это время не трогается — она остаётся в opacity: 0 и
   * проявляется отдельно, уже ПОСЛЕ наезда, в первые CARD_FADE_IN
   * прогресса основного слайдера (см. ниже) — по той же покадровой сцене
   * card остаётся невидимой даже на кадре, где наезд уже полностью
   * завершён (радиус уже 0%), и появляется только на следующем.
   *
   * Тот же riseTrigger параллельно поднимает Intro-overlay (см.
   * IntroSection.tsx) из opacity: 0 до 1 за первую половину наезда — тот
   * же приём и та же формула (`progress / 0.5`), что у Capacity-overlay в
   * PresenceSection.tsx. */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const slider = sliderRef.current
    const card = cardRef.current
    const intro = document.getElementById('intro')
    const overlay = intro?.querySelector<HTMLElement>('.Intro-overlay')
    if (!wrap || !section || !slider || !overlay) return

    slider.style.borderRadius = '50vmin'
    // Синхронно, до первого срабатывания onUpdate (тот же приём, что и
    // borderRadius выше) — иначе на reload/refresh карточка на первый
    // кадр рисуется с дефолтной непрозрачностью (className её не задаёт)
    // и заметно "моргает" перед тем, как GSAP выставит настоящий opacity.
    // backdrop-blur на Location-top/-footer (см. LocationCard.tsx) — сразу
    // штатные 1.25rem, без раскрутки: card всё равно в opacity: 0, блюра
    // не видно, а как только opacity начинает расти, backdrop-blur уже
    // готов — крестфейд получается на одном свойстве (opacity), без
    // прежнего "довключения" блюра поверх уже проявившейся карточки.
    if (card) {
      card.style.opacity = '0'
    }

    const wrapTop = () => {
      const r = wrap.getBoundingClientRect()
      return r.top + window.scrollY
    }

    const riseTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() - window.innerHeight,
      end: wrapTop,
      scrub: true,
      onUpdate: (self) => {
        slider.style.borderRadius = `${(1 - self.progress) * 50}vmin`
        overlay.style.opacity = String(gsap.utils.clamp(0, 1, self.progress / 0.5))
      },
    })

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: wrapTop,
      end: () => wrapTop() + window.innerHeight * ACTIVE_VH,
      scrub: true,
      onUpdate: (self) => {
        // self.progress — 0..1 по укороченной (ACTIVE_VH) дистанции;
        // пересчитываем обратно в 0..1 по "виртуальному" PIN_VH-отсчёту
        // (умножая на ту же долю, что и укоротили), чтобы все формулы
        // границ ниже (boundary = (i+1)/SLIDE_COUNT и т.п., линейные
        // в PIN_VH-домене) остались нетронутыми, а темп первых
        // кроссфейдов не изменился.
        const progress = self.progress * LAST_CROSSFADE_END

        // Верхний слайд i плавно гаснет вокруг границы (i+1)/SLIDE_COUNT,
        // открывая слайд i+1, лежащий под ним в стеке.
        for (let i = 0; i < SLIDE_COUNT - 1; i++) {
          const boundary = (i + 1) / SLIDE_COUNT
          const from = boundary - CROSSFADE / 2
          const to = boundary + CROSSFADE / 2
          const local = gsap.utils.clamp(0, 1, (progress - from) / (to - from))
          const el = slideEls.current[i]
          if (el) el.style.opacity = String(1 - smoothstep(local))
        }

        const index = Math.min(
          SLIDE_COUNT - 1,
          Math.floor(progress * SLIDE_COUNT),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))

        // Линейно, без ease — так проявление ощущается напрямую
        // привязанным к скроллу, а не рывком в начале и подвисанием в
        // конце. backdrop-blur на дочерних Location-top/Location-footer
        // (см. LocationCard.tsx) держится штатным (1.25rem, без JS) —
        // раньше блюр тоже раскручивали вручную с 0 синхронно с opacity, но
        // на глаз это давало обратный эффект: opacity успевает долистать до
        // 1 заметно раньше, чем блюр — карточка проявляется резкой (ещё не
        // заблюренной), а потом блюр "довключается" поверх уже видимой
        // карточки. Раз opacity и backdrop-filter родителя/детей и так
        // композитятся браузером как единый слой (сначала рисуется уже
        // заблюренная подложка, потом её альфа умножается на opacity
        // родителя), константный блюр с самого начала (пока opacity: 0, его
        // всё равно не видно) убирает этот рассинхрон — card проявляется
        // уже готовой, сразу с нужной степенью блюра.
        if (card) {
          const cardT = gsap.utils.clamp(0, 1, progress / CARD_FADE_IN)
          card.style.opacity = String(cardT)
        }
      },
    })

    return () => {
      riseTrigger.kill()
      trigger.kill()
      slider.style.borderRadius = ''
      overlay.style.opacity = ''
      if (card) {
        card.style.opacity = ''
      }
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Location1-pin-wrap relative z-[46]"
      /* dvh, не vh — см. комментарий у Hero-pin-wrap в HeroSection.tsx:
       * держит эту дистанцию в одной системе отсчёта с window.innerHeight,
       * которым считает JS (иначе на мобильном Chrome/Yandex, где тулбар
       * скрывается по ходу скролла, здесь накапливался тот же разъезд). */
      style={{ height: `${(2 + ACTIVE_VH) * 100}dvh`, marginTop: '-100dvh' }}
    >
      <section
        id="location1"
        ref={sectionRef}
        className="Location1 sticky top-0 flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
      >
        <LocationCard
          ref={cardRef}
          activeIndex={activeIndex}
          onBookNow={onBookNow}
          quote="Height clears perception, form gathers focus, and silence restores clarity."
          locationLabel="Location 1"
          nameLines={['The', 'Cliff Villa']}
          onStepClick={handleStepClick}
        />
        <LocationSlider
          ref={sliderRef}
          baseSrc={baseImg}
          slides={SLIDES}
          setSlideRef={setSlideRef}
        />
      </section>
    </div>
  )
}
