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

type LocationSliderProps = {
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

export default function LocationSlider({ setSlideRef }: LocationSliderProps) {
  return (
    <div className="Location1-slider absolute inset-0 isolate flex flex-col items-center overflow-hidden">
      <img
        src={baseImg}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />

      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          ref={setSlideRef(i)}
          className={`Retreat-slide-${i + 1} absolute inset-0`}
          style={{ zIndex: SLIDES.length - i }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? undefined : 'lazy'}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />
        </div>
      ))}
    </div>
  )
}
