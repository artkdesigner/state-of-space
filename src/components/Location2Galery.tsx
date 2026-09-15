import img1 from '../assets/location2/galery-img-1.webp'
import img2 from '../assets/location2/galery-img-2.webp'
import img3 from '../assets/location2/galery-img-3.webp'
import img4 from '../assets/location2/galery-img-4.webp'
import img5 from '../assets/location2/galery-img-5.webp'

type Location2GaleryProps = {
  col2Ref: (el: HTMLDivElement | null) => void
}

/** Три раскладки, три Figma-фрейма:
 *
 * - Mobile (база, без префикса) — по прямой просьбе пользователя ТОЛЬКО
 *   статичная раскладка конечного кадра (3 равные строки, 16.75rem), без
 *   scroll-jacking анимации: на mobile у Location2 вообще нет пина/трека
 *   (см. useEffect в Location2Section.tsx — там matchMedia только на
 *   md/lg), заводить под один этот блок первый на mobile scroll-jacking
 *   пин признано лишним усложнением. Поэтому тут просто обычный,
 *   auto-height блок в потоке (без h-dvh/w-dvw/shrink-0 — как и у
 *   Location2Retreat.tsx на mobile).
 * - Tablet (md) — своя, вертикальная squeeze-анимация (та же идея, что у
 *   desktop-раскладки ниже, только по высоте, а не по ширине): Galery-col-2
 *   едет от 97.8515625% (кадр 1, во весь экран) до 32.03125% (кадр 2, треть),
 *   толкая/открывая col-1/col-3 (фикс. 32.03125%) сверху/снизу через
 *   `justify-center` + `overflow-clip` на обёртке — управляется JS
 *   (`galeryCol2Ref`/setCol2Height) в Location2Section.tsx, tablet-ветка.
 *   Проценты, не rem — см. комментарий у TABLET_GALERY_COL2_REST_HEIGHT_PCT
 *   там же: rem (от ширины) верно совпадал бы с высотой контейнера только
 *   при точно таком же соотношении сторон, что у эталонного tablet-фрейма
 *   768×1024 — у реальных iPad оно другое (плюс `dvh` на iOS Safari ещё и
 *   сам по себе не совпадает с шириной), из-за чего col-1/col-3 обрезались.
 * - Desktop (lg) — исходная раскладка колонками, без изменений.
 *
 * DOM-порядок img1→img2 (col-1) и img4→img5 (col-3) — как в desktop
 * (там это порядок сверху вниз в flex-col); на mobile/tablet визуальный
 * порядок в строке обратный (img2 слева от img1, img5 слева от img4, см.
 * Figma) — меняю его через `order-*`, не через DOM, чтобы не трогать уже
 * рабочую desktop-раскладку. */
export default function Location2Galery({ col2Ref }: Location2GaleryProps) {
  return (
    <div className="Location2-galery flex flex-col items-center justify-center gap-2.5 overflow-clip bg-light p-2.5 md:h-dvh md:w-dvw md:shrink-0 lg:h-dvh lg:w-[120rem] lg:shrink-0 lg:flex-row lg:items-start lg:justify-center lg:gap-5 lg:overflow-visible lg:p-5">
      <div className="Galery-col-1 flex h-[16.75rem] w-full shrink-0 items-end justify-end gap-2.5 md:h-[32.03125%] lg:h-full lg:w-[38.3125rem] lg:flex-col lg:justify-normal lg:gap-5 lg:overflow-hidden lg:rounded-[1.875rem]">
        <img
          src={img1}
          alt="The Island Retreat pavilion roofline among the pines"
          className="Galery-img-1 order-2 h-full w-[12.25rem] rounded-[1rem] object-cover md:w-[12.5rem] lg:order-none lg:h-[20rem] lg:w-full lg:rounded-[1.875rem]"
        />
        <img
          src={img2}
          alt="The Island Retreat pool deck between the pines"
          className="Galery-img-2 order-1 size-[6.25rem] rounded-[1rem] object-cover md:size-[12.25rem] lg:order-none lg:h-[18.75rem] lg:w-[25rem] lg:rounded-[1.875rem]"
        />
      </div>

      <div
        ref={col2Ref}
        className="Galery-col-2 flex h-[16.75rem] w-full shrink-0 flex-col items-center justify-center overflow-hidden md:h-[97.8515625%] lg:h-full lg:w-auto lg:shrink-0"
      >
        <img
          src={img3}
          alt="The Island Retreat pavilion nestled among tall pine trees"
          className="Galery-img-3 h-full w-full rounded-[1rem] object-cover lg:min-h-px lg:flex-1 lg:rounded-[3.75rem]"
        />
      </div>

      <div className="Galery-col-3 flex h-[16.75rem] w-full shrink-0 items-start gap-2.5 md:h-[32.03125%] lg:h-full lg:w-[38.3125rem] lg:flex-col lg:justify-end lg:gap-5 lg:overflow-hidden lg:rounded-[1.875rem]">
        <img
          src={img4}
          alt="The Island Retreat guest room interior"
          className="Galery-img-4 order-2 size-[6.25rem] rounded-[1rem] object-cover md:size-[12.25rem] lg:order-none lg:h-[18.75rem] lg:w-[25rem] lg:rounded-[1.875rem]"
        />
        <img
          src={img5}
          alt="The Island Retreat terrace overlooking the coastline"
          className="Galery-img-5 order-1 h-full w-[12.25rem] rounded-[1rem] object-cover lg:order-none lg:h-[20rem] lg:w-full lg:rounded-[1.875rem]"
        />
      </div>
    </div>
  )
}
