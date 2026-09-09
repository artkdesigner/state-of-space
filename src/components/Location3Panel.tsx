import LocationCard from './LocationCard'
import LocationSlider from './LocationSlider'
import baseImg from '../assets/location3-slider-base.webp'
import slide1 from '../assets/location3-slide-1.webp'
import slide2 from '../assets/location3-slide-2.webp'
import slide3 from '../assets/location3-slide-3.webp'

const SLIDES = [
  {
    src: slide1,
    alt: 'The Water Residence yacht deck at sunset, hills rising across the water',
  },
  {
    src: slide2,
    alt: 'The Water Residence yacht cruising along the coastline',
  },
  {
    src: slide3,
    alt: 'The Water Residence yacht deck seating overlooking the sea',
  },
]

type Location3PanelProps = {
  activeIndex: number
  onBookNow: () => void
  setSlideRef: (index: number) => (el: HTMLDivElement | null) => void
}

/** Панель Location3 внутри общего горизонтального трека Location2Section.tsx
 * (см. её useEffect — тот же crossfade-приём, что уже был у
 * Location2Retreat.tsx, просто с ещё одним набором слайдов). Раньше это
 * была отдельная Location3Section.tsx со своим вертикальным пином и
 * наездом сбоку (translateX + скругление капсулой) — убрана по просьбе
 * пользователя: отдельный вертикальный пин с ручным наездом поверх ещё
 * едущего Location2 давал шов (пустой фон Location3-pin-wrap на
 * мгновение перекрывал Balance ДО того, как начинался сам наезд). Простая
 * панель в уже существующем горизонтальном потоке этого не имеет —
 * трек просто продолжает катиться дальше, без отдельной точки стыка. */
export default function Location3Panel({
  activeIndex,
  onBookNow,
  setSlideRef,
}: Location3PanelProps) {
  return (
    <section
      id="location3"
      className="Location3 relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 md:w-dvw md:shrink-0 lg:px-5 lg:pt-30 lg:pb-5"
    >
      <LocationCard
        activeIndex={activeIndex}
        onBookNow={onBookNow}
        quote={
          'Where earth meets water, a profound sense of "I am here" naturally arises.'
        }
        locationLabel="Location 3"
        nameLines={['The Water Residence']}
      />
      <LocationSlider baseSrc={baseImg} slides={SLIDES} setSlideRef={setSlideRef} />
    </section>
  )
}
