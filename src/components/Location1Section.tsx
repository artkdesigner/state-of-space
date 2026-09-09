import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
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
   * тот же приём, что у Hero-img (см. HeroSection.tsx) — `border-radius:
   * 50%` на уже full-bleed (`absolute inset-0`) картинке с
   * `overflow-hidden` даёт вписанный эллипс, а поскольку сама секция в
   * этот момент только частично видна (въезжает снизу обычным document
   * flow), на экране это выглядит как растущая снизу дуга — линейно к
   * border-radius: 0% ровно к моменту, когда наезд завершён (см.
   * покадровую сцену в Figma «Intro to Location1» 1..7). Location-карточка
   * (LocationCard) в это время не трогается — она остаётся в opacity: 0 и
   * проявляется отдельно, уже ПОСЛЕ наезда, в первые CARD_FADE_IN
   * прогресса основного слайдера (см. ниже) — по той же покадровой сцене
   * card остаётся невидимой даже на кадре, где наезд уже полностью
   * завершён (радиус уже 0%), и появляется только на следующем. */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    const slider = sliderRef.current
    const card = cardRef.current
    if (!wrap || !section || !slider) return

    slider.style.borderRadius = '50%'
    // Синхронно, до первого срабатывания onUpdate (тот же приём, что и
    // borderRadius выше) — иначе на reload/refresh карточка на первый
    // кадр рисуется с дефолтной непрозрачностью (className её не задаёт)
    // и заметно "моргает" перед тем, как GSAP выставит настоящий opacity.
    if (card) {
      card.style.opacity = '0'
      card.style.setProperty('--location-blur', '0rem')
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
        slider.style.borderRadius = `${(1 - self.progress) * 50}%`
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
        // не интерполируется браузером вместе с opacity родителя (типовой
        // артефакт backdrop-filter — он либо есть, либо ощутимо
        // "подскакивает" на пороге видимости), поэтому радиус блюра тоже
        // гоним вручную тем же прогрессом через --location-blur, от 0 до
        // штатных 1.25rem.
        if (card) {
          const cardT = gsap.utils.clamp(0, 1, progress / CARD_FADE_IN)
          card.style.opacity = String(cardT)
          card.style.setProperty('--location-blur', `${cardT * 1.25}rem`)
        }
      },
    })

    return () => {
      riseTrigger.kill()
      trigger.kill()
      slider.style.borderRadius = ''
      if (card) {
        card.style.opacity = ''
        card.style.removeProperty('--location-blur')
      }
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Location1-pin-wrap relative z-[46]"
      style={{ height: `${(2 + ACTIVE_VH) * 100}vh`, marginTop: '-100vh' }}
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
