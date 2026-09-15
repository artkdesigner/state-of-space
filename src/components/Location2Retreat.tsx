import { forwardRef } from 'react'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import { scrollToLocation2RetreatSlide } from './Location2Section'
import baseImg from '../assets/location2/retreat-slider-base.webp'
import slide1 from '../assets/location2/retreat-slide-1.webp'
import slide2 from '../assets/location2/retreat-slide-2.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Island Retreat seen through wind-shaped pine trees at golden hour',
  },
  {
    src: slide2,
    alt: 'The Island Retreat pavilion framed by pine branches at dusk',
  },
  {
    src: baseImg,
    alt: 'The Island Retreat surrounded by pine trees on the coastline',
  },
]

type Location2RetreatProps = {
  activeIndex: number
  onBookNow: () => void
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

const Location2Retreat = forwardRef<HTMLDivElement, Location2RetreatProps>(
  function Location2Retreat({ activeIndex, onBookNow, setSlideRef }, ref) {
    return (
      <div
        ref={ref}
        className="Location2-retreat flex flex-col items-center md:h-dvh md:w-dvw md:shrink-0"
      >
        <div className="Retreat-col-2 relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden p-2.5 md:h-full md:flex-1">
          <LocationCard
            activeIndex={activeIndex}
            onStepClick={scrollToLocation2RetreatSlide}
            onBookNow={onBookNow}
            quote={
              'Where earth meets water, a profound sense of "I am here" naturally arises.'
            }
            locationLabel="Location 2"
            nameLines={['The', 'Island Retreat']}
          />
          <LocationSlider
            baseSrc={baseImg}
            slides={SLIDES}
            setSlideRef={setSlideRef}
          />
        </div>
      </div>
    )
  },
)

export default Location2Retreat
