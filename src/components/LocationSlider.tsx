type Slide = {
  src: string
  alt: string
}

type LocationSliderProps = {
  baseSrc: string
  slides: Slide[]
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

export default function LocationSlider({
  baseSrc,
  slides,
  setSlideRef,
}: LocationSliderProps) {
  return (
    <div className="Location-slider absolute inset-0 isolate flex flex-col items-center overflow-hidden">
      <img
        src={baseSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />

      {slides.map((slide, i) => (
        <div
          key={slide.src}
          ref={setSlideRef(i)}
          className={`Location-slide-${i + 1} absolute inset-0`}
          style={{ zIndex: slides.length - i }}
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
