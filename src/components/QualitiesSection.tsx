import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion, useCounter, useInView } from '../lib/anim'
import qualitiesArchitecture from '../assets/qualities-architecture.webp'
import qualitiesElementalRituals from '../assets/qualities-elemental-rituals.webp'
import qualitiesProtectedSolitude from '../assets/qualities-protected-solitude.webp'
import qualitiesTemporalFreedom from '../assets/qualities-temporal-freedom.webp'
import qualitiesSensoryRestraint from '../assets/qualities-sensory-restraint.webp'
import qualitiesSpatialPresence from '../assets/qualities-spatial-presence.webp'
import qualitiesMentalClarity from '../assets/qualities-mental-clarity.webp'

const QUALITIES = [
  { title: 'Architecture', image: qualitiesArchitecture },
  { title: 'Elemental Rituals', image: qualitiesElementalRituals },
  { title: 'Protected Solitude', image: qualitiesProtectedSolitude },
  { title: 'Temporal Freedom', image: qualitiesTemporalFreedom },
  { title: 'Sensory Restraint', image: qualitiesSensoryRestraint },
  { title: 'Spatial Presence', image: qualitiesSpatialPresence },
  { title: 'Mental Clarity', image: qualitiesMentalClarity },
]

/** Скролл-дистанция скругления нижних углов Qualities, в высотах
 * вьюпорта — начинается не сразу, а только когда Qualities, уезжая вверх
 * обычным document flow, уже освободила под собой половину экрана (см.
 * roundStart в useEffect ниже), по просьбе пользователя. Та же идея, что
 * раньше уже была связана с AboveSection.tsx (см. историю git) — оттуда
 * убрана по прошлой просьбе пользователя, теперь возвращается как
 * самостоятельная анимация самой Qualities, ни от чего больше не
 * зависящая (текущий AboveSection.tsx её больше не компенсирует и не
 * ждёт — там теперь просто буферный RISE_VH). */
const ROUND_VH = 1

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** cubic-bezier для `ease: out` — тот же дефолт, что у <Reveal> в lib/anim.tsx. */
const REVEAL_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Qualities-item появляется slide-up + opacity не сразу на нижней границе
 * экрана, а когда пересекает линию на 20% выше неё (по прямой просьбе
 * пользователя — раньше срабатывало слишком рано, ровно на самой границе).
 * Bottom-margin rootMargin в -20% отрезает нижние 20% вьюпорта от зоны
 * пересечения — IntersectionObserver считает элемент видимым только выше
 * этой линии. И ТАК ЖЕ уходит обратно (opacity/сдвиг реверсируются), когда
 * скролим назад и элемент снова уходит за эту линию — по прямой просьбе
 * пользователя (`once: false`, а не `once: true`, как было раньше: тогда
 * анимация проигрывалась один раз и больше не реагировала на обратный
 * скролл). rootMargin с огромным запасом СВЕРХУ — без него
 * IntersectionObserver считает элемент "не в вьюпорте" и тогда, когда он
 * обычным скроллом ВПЕРЁД уходит за ВЕРХНЮЮ границу (уже прочитан), и
 * пункты гасли бы один за другим по мере чтения списка, хотя реверс должен
 * реагировать только на нижнюю (точнее — сдвинутую на 20%) границу.
 * Вынесен в отдельный компонент, чтобы useInView вызывался на верхнем
 * уровне (а не внутри .map в QualitiesSection). */
function QualityItem({
  quality,
  isActive,
  onActivate,
}: {
  quality: (typeof QUALITIES)[number]
  isActive: boolean
  onActivate: () => void
}) {
  const [ref, inView] = useInView<HTMLButtonElement>({
    once: false,
    amount: 0,
    rootMargin: '9999px 0px -20% 0px',
  })

  return (
    <button
      ref={ref}
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className="Qualities-item cursor-pointer text-left"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(1.5rem)',
        transition: `opacity 600ms ${REVEAL_EASE}, transform 600ms ${REVEAL_EASE}`,
      }}
    >
      <span
        className={`font-manrope text-[1.625rem] font-medium leading-none tracking-[-0.04em] transition-colors duration-300 md:text-[3.125rem] lg:text-[8.75rem] ${
          isActive ? 'text-dark' : 'text-dark/30'
        }`}
      >
        {quality.title}
      </span>
    </button>
  )
}

export default function QualitiesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoursRef, hours] = useCounter<HTMLParagraphElement>(72)
  const [metersRef, meters] = useCounter<HTMLParagraphElement>(1650)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (reduceMotion()) return

    // Момент, когда нижний край Qualities поднялся ровно до середины
    // вьюпорта (под ней уже открылось пол экрана Above) — getBoundingClientRect,
    // не строковый маркер: тот же приём (и то же обоснование — реальная
    // высота предыдущих pin-секций отличается на первом проходе), что
    // recedeStart в старой версии AboveSection.tsx (см. git-историю).
    const roundStart = () => {
      const r = section.getBoundingClientRect()
      return r.top + r.height - window.innerHeight / 2 + window.scrollY
    }

    // Радиус — в px от МЕНЬШЕЙ стороны секции, не в % (см. ту же правку в
    // Location2Section.tsx/CliffSection.tsx): секция на tablet/mobile не
    // квадратная (высота либо 100dvh, либо своя контентная — в любом
    // случае намного меньше ширины), а border-radius в `%` считается
    // отдельно от ширины и от высоты — угол получался вытянутым эллипсом
    // вместо ровной круглой дуги (жалоба пользователя). min(width,height)
    // даёт корректный "квадратный" угол на любом соотношении сторон.
    const measureMinSide = () =>
      Math.min(section.offsetWidth, section.offsetHeight)
    let minSide = measureMinSide()
    const onResize = () => {
      minSide = measureMinSide()
    }
    window.addEventListener('resize', onResize)

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: roundStart,
      end: () => `+=${window.innerHeight * ROUND_VH}`,
      scrub: true,
      onUpdate: (self) => {
        const radius = `${(minSide / 2) * easeOutCubic(self.progress)}px`
        section.style.borderBottomLeftRadius = radius
        section.style.borderBottomRightRadius = radius
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      trigger.kill()
      section.style.borderBottomLeftRadius = ''
      section.style.borderBottomRightRadius = ''
    }
  }, [])

  return (
    <section
      id="qualities"
      ref={sectionRef}
      className="Qualities relative flex h-dvh w-full flex-col items-center justify-between gap-15 overflow-hidden bg-light lg:h-auto lg:justify-normal lg:gap-30"
    >
      <div className="Qualities-top relative flex w-full flex-col items-start px-2.5 pt-15 md:flex-row md:items-end md:justify-center md:gap-4 md:px-2.5 md:pt-30 lg:flex-col lg:items-end lg:justify-center lg:gap-10 lg:px-5">
        <div className="Qualities-img-wrap absolute hidden overflow-hidden rounded-[0.75rem] left-2.5 top-78.5 h-39 w-29 md:block lg:left-5 lg:top-175 lg:h-100 lg:w-74.5 lg:rounded-[1.875rem]">
          {QUALITIES.map((quality, index) => (
            <div
              key={quality.title}
              className={`Qualities-img absolute inset-0 transition-opacity duration-700 ease-out ${
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={quality.image}
                alt={quality.title}
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="Qualities-list flex w-full flex-col items-end gap-2.5 pr-2.5 md:flex-1 md:justify-center md:gap-0 md:pr-0 lg:w-full lg:flex-none lg:justify-center">
          <div className="flex flex-col gap-2.5 md:gap-0 lg:gap-0">
            {QUALITIES.map((quality, index) => (
              <QualityItem
                key={quality.title}
                quality={quality}
                isActive={index === activeIndex}
                onActivate={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="Qualities-numbers flex w-full flex-col items-start justify-end gap-5 px-2.5 pb-5 font-manrope font-medium md:flex-row md:items-end md:gap-2.5 md:px-2.5 md:pb-5 lg:gap-5 lg:px-5 lg:pt-5 lg:pb-10">
        <div className="Qualities-numbers-left flex w-full items-start gap-2 md:w-60.75 md:flex-col md:items-start md:gap-2.5 lg:w-153.25 lg:gap-5">
          <p className="w-27.25 text-[0.875rem] leading-[1.3] tracking-[-0.01em] text-dark/60 md:w-full md:text-dark lg:text-[1.125rem]">
            Hours to enter the state
          </p>
          <p
            ref={hoursRef}
            className="Qualities-numbers-num whitespace-nowrap text-[5.625rem] leading-[0.75] tracking-[-0.06em] text-dark md:text-[10.5rem] lg:text-[26.25rem]"
          >
            {hours}
          </p>
        </div>

        <div className="Qualities-numbers-right flex w-full items-start gap-2 md:flex-1 md:flex-col md:items-start md:gap-2.5 lg:gap-5">
          <p className="w-27.25 text-[0.875rem] leading-[1.3] tracking-[-0.01em] text-dark/60 md:w-full md:text-dark lg:text-[1.125rem]">
            Meters above sea level
          </p>
          <p
            ref={metersRef}
            className="Qualities-numbers-num whitespace-nowrap text-[5.625rem] leading-[0.75] tracking-[-0.06em] text-dark md:text-[10.5rem] lg:text-[26.25rem]"
          >
            {meters}
          </p>
        </div>
      </div>
    </section>
  )
}
