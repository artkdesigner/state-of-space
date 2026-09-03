import { forwardRef } from 'react'
import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import baseImg from '../assets/location2/retreat-slider-base.webp'
import slide1 from '../assets/location2/retreat-slide-1.webp'
import slide2 from '../assets/location2/retreat-slide-2.webp'
import img1 from '../assets/location2/retreat-img-1.webp'
import img2 from '../assets/location2/retreat-img-2.webp'
import img3 from '../assets/location2/retreat-img-3.webp'
import img4 from '../assets/location2/retreat-img-4.webp'

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
        <div className="Retreat-col-1 flex w-full items-end justify-end gap-2.5 px-2.5 pt-2.5 md:hidden">
          <img
            src={img1}
            alt=""
            loading="lazy"
            className="Retreat-img-1 size-25 rounded-xl object-cover"
          />
          <img
            src={img2}
            alt="The Island Retreat pavilion exterior among pine trees"
            loading="lazy"
            className="Retreat-img-2 h-67 w-47.5 rounded-xl object-cover"
          />
        </div>

        <div className="Retreat-col-2 relative flex w-full flex-col items-center justify-end overflow-hidden p-2.5 md:h-full md:flex-1">
          <LocationCard
            activeIndex={activeIndex}
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

        <div className="Retreat-col-3 flex w-full items-start gap-2.5 px-2.5 pb-2.5 md:hidden">
          <img
            src={img3}
            alt="The Island Retreat pool terrace among pine trees"
            loading="lazy"
            className="Retreat-img-3 h-67 w-47.5 rounded-xl object-cover"
          />
          <img
            src={img4}
            alt=""
            loading="lazy"
            className="Retreat-img-4 size-25 rounded-xl object-cover"
          />
        </div>
      </div>
    )
  },
)

export default Location2Retreat
