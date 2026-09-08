import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import {
  LOCATION1_PIN_VH,
  location1PinStart,
  location1SliderEnd,
} from '../lib/scrollChain'
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

/** Число слайдов — совпадает с LOCATION1_PIN_VH (см. scrollChain.ts):
 * ровно 1 экран высоты скролла на слайд. */
const SLIDE_COUNT = LOCATION1_PIN_VH
/** Доля общего прогресса секции, за которую верхний слайд успевает уйти. */
const CROSSFADE = 0.28
/** Доля прогресса, за которую Location-карточка успевает проявиться из
 * прозрачности после того, как секция встала на место. */
const CARD_FADE_IN = 0.2

/** Smoothstep — тот же диапазон, что и линейная интерполяция, но мягче на краях. */
const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Location1SectionProps = {
  onBookNow: () => void
}

export default function Location1Section({ onBookNow }: Location1SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    slideEls.current[index] = el
  }

  /* Слайдер-кроссфейд Location1 (SLIDE_COUNT вьюпортов) + ещё 1 лишний
   * вьюпорт заморозки сверху (тот же приём, что у Hero-wrap/Intro-wrap/
   * capacityTrigger — см. HeroSection.tsx/IntroSection.tsx/
   * AboveSection.tsx): пин длится (1 + SLIDE_COUNT) вьюпортов и кончается
   * РОВНО на `location1SliderEnd` — а не на SLIDE_COUNT, как раньше. Без
   * этой заморозки Location1, отпустив пин на SLIDE_COUNT, целый
   * следующий вьюпорт естественно (никем не управляемо) уезжала прочь
   * ДО того, как Cliff-пин (start: `location1PinEnd`, см.
   * CliffSection.tsx и scrollChain.ts — эта натуральная позиция Cliff ещё
   * на 1 вьюпорт ПОЗЖЕ `location1SliderEnd`, ровно на собственную высоту
   * Location1, которую GSAP-пин добавляет к pin-спейсеру сам) вообще
   * успевал включиться — на границе было видно то пустой экран, то рывок
   * при активации пина Cliff. Прогресс для
   * кроссфейда/индекса/карточки ниже пересчитан (`progress`) так, чтобы
   * он доигрывал до 1 ровно к концу "настоящих" SLIDE_COUNT вьюпортов и
   * дальше держался (не растягивался на весь новый диапазон) — тот же
   * пересчёт, что у `grow` в capacityTrigger (AboveSection.tsx).
   * Location-карточка (LocationCard) проявляется из opacity: 0 в первые
   * CARD_FADE_IN этого пересчитанного прогресса — то есть тоже
   * укладывается в "настоящие" SLIDE_COUNT вьюпорта, а не в добавленный
   * вьюпорт заморозки. Сам наезд Location1 на Cliff (margin-top на
   * `#location1`, снятие Location1 «со сцены») теперь целиком в
   * CliffSection.tsx — раньше здесь была ДУБЛИРУЮЩАЯ версия (тянула
   * `cliff.style.marginTop`), оставшаяся от более старой архитектуры, где
   * Cliff ещё не имел собственного `start: location1PinEnd`; она не была
   * убрана при миграции и создавала как раз тот баг, который чинит этот
   * коммит — Cliff преждевременно подтягивался вверх ещё во время
   * слайдера, а затем никем не управляемый "дрейфовал" до включения
   * своего настоящего пина, отчего в момент включения он резко
   * телепортировался на нужную позицию.
   *
   * `start` — точная позиция скролла (`location1PinStart`, см.
   * src/lib/scrollChain.ts), а не 'top top': при 'top top' и быстром
   * скролле (флик) секция телепортируется на нужную позицию вместо
   * плавного пина — см. подробный комментарий в IntroSection.tsx.
   * Сама секция при этом сдвинута статическим `margin-top: -100vh` (см.
   * className ниже) — тот же приём, что подтягивает Intro во время Hero
   * (см. HeroSection.tsx/IntroSection.tsx/scrollChain.ts): пока Intro
   * ещё приклеена (её собственный `INTRO_PIN_VH` reveal уже доигран, но
   * wrap держит её ещё 1 лишний вьюпорт), Location1 естественным
   * document flow въезжает снизу вверх и полностью её закрывает —
   * настоящий cover-переход, а не последовательная прокрутка. `start`
   * пина (`location1PinStart`) — это ровно тот момент, когда въезд
   * закончился (Location1 уже целиком закрыла экран).
   *
   * Пока идёт сам наезд (последний вьюпорт ПЕРЕД location1PinStart, ещё
   * до пина — см. riseTrigger ниже), Location-slider раскруглятся: тот
   * же приём, что у Hero-img (см. HeroSection.tsx) — `border-radius: 50%`
   * на уже full-bleed (`absolute inset-0`) картинке с `overflow-hidden`
   * даёт вписанный эллипс, а поскольку сама секция в этот момент только
   * частично видна (въезжает снизу обычным document flow), на экране это
   * выглядит как растущая снизу дуга — линейно к border-radius: 0% ровно
   * к моменту, когда наезд завершён (см. покадровую сцену в Figma «Intro
   * to Location1» 1..7). Location-карточка (LocationCard) в это время не
   * трогается — она остаётся в opacity: 0 и проявляется отдельно, уже
   * ПОСЛЕ наезда, в первые CARD_FADE_IN прогресса основного пина (см.
   * ниже) — по той же покадровой сцене card остаётся невидимой даже на
   * кадре, где наезд уже полностью завершён (радиус уже 0%), и
   * появляется только на следующем. */
  useEffect(() => {
    const section = sectionRef.current
    const slider = sliderRef.current
    const card = cardRef.current
    if (!section || !slider) return

    slider.style.borderRadius = '50%'

    const riseTrigger = ScrollTrigger.create({
      trigger: section,
      start: () => location1PinStart() - window.innerHeight,
      end: location1PinStart,
      scrub: true,
      onUpdate: (self) => {
        slider.style.borderRadius = `${(1 - self.progress) * 50}%`
      },
    })

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: location1PinStart,
      end: location1SliderEnd,
      pin: true,
      scrub: true,
      /* Раньше здесь вызывался ScrollTrigger.refresh() в onLeave (и
       * симметрично в onEnterBack) — начало пина Cliff берётся по чистой
       * формуле (`location1PinEnd`, см. scrollChain.ts), пересчитывать тут
       * нечего. refresh() при смене размеров pin-спейсеров может САМ
       * подвинуть scroll(), чтобы сохранить прогресс активного пина — при
       * быстром скролле назад-вперёд прямо на границе Hero/Intro это и
       * давало скачок-телепорт (см. HeroSection.tsx и видео в переписке с
       * пользователем 2026-09-08). */
      onUpdate: (self) => {
        // Пересчёт: сырой self.progress идёт по (1 + SLIDE_COUNT)
        // вьюпортам пина, а кроссфейд/индекс/карточка должны доиграть за
        // "настоящие" SLIDE_COUNT и дальше держаться (см. комментарий
        // выше и grow в capacityTrigger, AboveSection.tsx).
        const progress = gsap.utils.clamp(
          0,
          1,
          (self.progress * (1 + SLIDE_COUNT)) / SLIDE_COUNT,
        )

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
    <section
      id="location1"
      ref={sectionRef}
      className="Location1 relative isolate z-[46] flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 lg:px-5 lg:pt-30 lg:pb-5"
      style={{ marginTop: '-100vh' }}
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
  )
}
