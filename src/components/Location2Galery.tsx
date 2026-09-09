import img1 from '../assets/location2/galery-img-1.webp'
import img2 from '../assets/location2/galery-img-2.webp'
import img3 from '../assets/location2/galery-img-3.webp'
import img4 from '../assets/location2/galery-img-4.webp'
import img5 from '../assets/location2/galery-img-5.webp'

type Location2GaleryProps = {
  col2Ref: (el: HTMLDivElement | null) => void
}

/** Только desktop (lg) — см. `SQUEEZE_VH`/матч-медиа в Location2Section.tsx:
 * на md колонки 613px в две штуки попросту не влезают рядом с центральной
 * фотографией, а второй Figma-раскладки для этого блока нет (см. память
 * «Never guess unselected Figma frames»), поэтому на md/mobile трек идёт
 * напрямую Location2-retreat → Location2-about, минуя галерею. */
export default function Location2Galery({ col2Ref }: Location2GaleryProps) {
  return (
    <div className="Location2-galery hidden items-start justify-center gap-5 bg-light p-5 lg:flex lg:h-dvh lg:w-[120rem] lg:shrink-0">
      <div className="Galery-col-1 flex h-full w-[38.3125rem] shrink-0 flex-col items-end gap-5 overflow-hidden rounded-[1.875rem]">
        <img
          src={img1}
          alt="The Island Retreat pavilion roofline among the pines"
          className="Galery-img-1 h-[20rem] w-full rounded-[1.875rem] object-cover"
        />
        <img
          src={img2}
          alt="The Island Retreat pool deck between the pines"
          className="Galery-img-2 h-[18.75rem] w-[25rem] rounded-[1.875rem] object-cover"
        />
      </div>

      <div
        ref={col2Ref}
        className="Galery-col-2 flex h-full shrink-0 flex-col items-center justify-center overflow-hidden"
      >
        <img
          src={img3}
          alt="The Island Retreat pavilion nestled among tall pine trees"
          className="Galery-img-3 min-h-px w-full flex-1 rounded-[3.75rem] object-cover"
        />
      </div>

      <div className="Galery-col-3 flex h-full w-[38.3125rem] shrink-0 flex-col items-start justify-end gap-5 overflow-hidden rounded-[1.875rem]">
        <img
          src={img4}
          alt="The Island Retreat guest room interior"
          className="Galery-img-4 h-[18.75rem] w-[25rem] rounded-[1.875rem] object-cover"
        />
        <img
          src={img5}
          alt="The Island Retreat terrace overlooking the coastline"
          className="Galery-img-5 h-[20rem] w-full rounded-[1.875rem] object-cover"
        />
      </div>
    </div>
  )
}
