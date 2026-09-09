import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MoveVisual from './MoveVisual'

const CARD_COUNT = 3
const PIN_VH = CARD_COUNT - 0.5

export default function MoveSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  /* Смена карточек, пока Move приклеена вверху (`position: sticky; top:
   * 0` внутри Move-pin-wrap — без margin-top, тот же случай, что
   * Location3Section.tsx). Сам «въезд» Move (растущая круглая маска,
   * элементы из scale/opacity 0) — не здесь, а в хвосте пина
   * BeyondSection.tsx (см. переход «Beyond to Move» в Figma): пока маска
   * растёт, Move ещё не приклеена сама по себе, это Beyond показывает её
   * копию (MoveVisual) поверх себя — к моменту, когда скролл долистывает
   * досюда, Move-секция уже выглядит как полностью доигравший финальный
   * кадр той сцены, и подхватывает обычным sticky без единого шва. */
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: () => '+=' + window.innerHeight * PIN_VH,
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(
          CARD_COUNT - 1,
          Math.floor(self.progress * CARD_COUNT),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Move-pin-wrap relative"
      style={{ height: `${(1 + PIN_VH) * 100}vh` }}
    >
      <section
        id="move"
        className="Move sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-light"
      >
        <div className="Move-pin relative flex h-full w-full flex-col items-center justify-center px-2.5">
          <MoveVisual activeIndex={activeIndex} />
        </div>
      </section>
    </div>
  )
}
