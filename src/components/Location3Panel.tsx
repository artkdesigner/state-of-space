import { forwardRef } from 'react'
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

/** Панель Location3 — НЕ часть флекс-трека Location2Section.tsx (см. её
 * JSX: сиблинг `Location2-track`, не его ребёнок), `md:absolute md:inset-0
 * md:z-20` — по прямой просьбе пользователя должна физически НАЕЗЖАТЬ
 * поверх уже неподвижной Balance, а не просто идти следующей панелью в
 * общей ленте (соседство в ленте не даёт перекрытия — трек просто
 * продолжает катиться, Balance уезжает влево, а не остаётся видна под
 * Location3). На mobile (нет `md:`-переопределений) это по-прежнему
 * обычный блок в вертикальном document flow, без анимации вообще — там
 * нет ни трека, ни Balance-наезда, все секции просто идут одна под
 * другой.
 *
 * Раньше это была отдельная Location3Section.tsx со своим ВЕРТИКАЛЬНЫМ
 * пином и наездом сбоку — убрана по прошлой просьбе пользователя:
 * отдельный вертикальный пин с ручным наездом поверх ещё едущего
 * Location2 давал шов (пустой фон Location3-pin-wrap на мгновение
 * перекрывал Balance ДО того, как начинался сам наезд). Текущая версия
 * того шва не имеет: Location3Panel всегда красится actual transform/
 * border-radius значениями (см. Location2Section.tsx `setLocation3Overlay`
 * — translateX 100%→0% + скругление левых углов 50%→0%, тот же приём,
 * что был у старой Location3Section, просто без отдельного pin-wrap) —
 * никогда не показывается в невизуализированном "дефолтном" виде,
 * поэтому шва физически неоткуда взяться. `overflow-hidden` в className —
 * не только клипует левые углы под радиус, но и прячет саму панель, пока
 * она ещё translateX(100%) (полностью за правым краем `section`, см.
 * `md:overflow-hidden` там же). Ref нужен для этого же inline-управления
 * (transform/radius) из Location2Section.tsx. */
const Location3Panel = forwardRef<HTMLElement, Location3PanelProps>(
  function Location3Panel({ activeIndex, onBookNow, setSlideRef }, ref) {
    return (
      <section
        id="location3"
        ref={ref}
        className="Location3 relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden px-2.5 pb-2.5 md:absolute md:inset-0 md:z-20 lg:px-5 lg:pt-30 lg:pb-5"
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
        <LocationSlider
          baseSrc={baseImg}
          slides={SLIDES}
          setSlideRef={setSlideRef}
        />
      </section>
    )
  },
)

export default Location3Panel
