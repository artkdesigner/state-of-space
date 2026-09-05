import { useState } from 'react'
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

export default function QualitiesSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section
      id="qualities"
      className="Qualities flex w-full flex-col items-center gap-15 bg-light lg:gap-30"
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
          <div className="flex flex-col">
            {QUALITIES.map((quality, index) => (
              <button
                key={quality.title}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className="Qualities-item cursor-pointer text-left"
              >
                <span
                  className={`font-manrope text-[1.625rem] font-medium leading-none tracking-[-0.04em] transition-colors duration-300 md:text-[3.125rem] lg:text-[8.75rem] ${
                    index === activeIndex ? 'text-dark' : 'text-dark/30'
                  }`}
                >
                  {quality.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="Qualities-numbers flex w-full flex-col items-start justify-end gap-5 px-2.5 pb-5 font-manrope font-medium md:flex-row md:items-end md:gap-2.5 md:px-2.5 md:pb-5 lg:gap-5 lg:px-5 lg:pt-5 lg:pb-10">
        <div className="Qualities-numbers-left flex w-full items-start gap-2 md:w-60.75 md:flex-col md:items-start md:gap-2.5 lg:w-153.25 lg:gap-5">
          <p className="w-27.25 text-[0.875rem] leading-[1.3] tracking-[-0.01em] text-dark/60 md:w-full md:text-dark lg:text-[1.125rem]">
            Hours to enter the state
          </p>
          <p className="whitespace-nowrap text-[5.625rem] leading-[0.75] tracking-[-0.06em] text-dark md:text-[10.5rem] lg:text-[26.25rem]">
            72
          </p>
        </div>

        <div className="Qualities-numbers-right flex w-full items-start gap-2 md:flex-1 md:flex-col md:items-start md:gap-2.5 lg:gap-5">
          <p className="w-27.25 text-[0.875rem] leading-[1.3] tracking-[-0.01em] text-dark/60 md:w-full md:text-dark lg:text-[1.125rem]">
            Meters above sea level
          </p>
          <p className="whitespace-nowrap text-[5.625rem] leading-[0.75] tracking-[-0.06em] text-dark md:text-[10.5rem] lg:text-[26.25rem]">
            1650
          </p>
        </div>
      </div>
    </section>
  )
}
