import { useEffect, useRef } from 'react'
import ctaIcon from '../assets/drift/cta-icon.svg'
import ctaIconMd from '../assets/drift/cta-icon-md.svg'
import ctaIconLg from '../assets/drift/cta-icon-lg.svg'
import cursor1 from '../assets/drift/cursor1.webp'
import cursor2 from '../assets/drift/cursor2.webp'
import cursor3 from '../assets/drift/cursor3.webp'

const CURSOR_IMAGES = [cursor1, cursor2, cursor3]

/** Скорость притяжения каждой картинки к курсору — разная, чтобы получился шлейф. */
const LERP_SPEEDS = [0.12, 0.09, 0.15]

/** Центр веера картинок в покое (десктоп, px от Drift), см. Figma-координаты ниже. */
const CENTROID = { x: 979, y: 586.33 }

type DriftSectionProps = {
  onBookNow: () => void
}

export default function DriftSection({ onBookNow }: DriftSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(min-width: 62rem)').matches) return

    const current = CURSOR_IMAGES.map(() => ({ x: 0, y: 0 }))
    const target = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      target.x = e.clientX - rect.left - CENTROID.x
      target.y = e.clientY - rect.top - CENTROID.y
    }
    section.addEventListener('mousemove', onMove)

    let raf = 0
    const tick = () => {
      cursorRefs.current.forEach((el, i) => {
        if (!el) return
        const c = current[i]
        const speed = LERP_SPEEDS[i]
        c.x += (target.x - c.x) * speed
        c.y += (target.y - c.y) * speed
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      section.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      id="drift"
      ref={sectionRef}
      className="Drift relative isolate flex h-dvh w-full flex-col justify-between overflow-hidden bg-light p-2.5 lg:p-5"
    >
      <h2 className="Drift-title relative z-5 font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
        Drift, balance, presence — held by Water Residence.
      </h2>

      <div
        ref={(el) => {
          cursorRefs.current[0] = el
        }}
        className="Drift-cursor-img absolute left-[4.25rem] top-[24.3125rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] md:left-[11.875rem] md:top-[28.375rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-[49.5625rem] lg:top-[32.8125rem]"
      >
        <img
          src={CURSOR_IMAGES[0]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div
        ref={(el) => {
          cursorRefs.current[1] = el
        }}
        className="Drift-cursor-img absolute left-[8.625rem] top-[20.3125rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] md:left-[19.125rem] md:top-[24.375rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-[56.8125rem] lg:top-[28.8125rem]"
      >
        <img
          src={CURSOR_IMAGES[1]}
          alt=""
          className="absolute left-[-209.49%] top-[-0.16%] h-full w-[382.5%] max-w-none object-cover"
        />
      </div>

      <div
        ref={(el) => {
          cursorRefs.current[2] = el
        }}
        className="Drift-cursor-img absolute left-[13.8125rem] top-[22.9375rem] w-25 h-[8.0625rem] overflow-hidden rounded-[0.75rem] md:left-[26.375rem] md:top-[27rem] md:h-[11.25rem] md:w-35 md:rounded-[1.875rem] lg:left-[64.0625rem] lg:top-[31.4375rem]"
      >
        <img
          src={CURSOR_IMAGES[2]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <a
        href="#booking"
        onClick={(e) => {
          e.preventDefault()
          onBookNow()
        }}
        className="cta relative z-4 flex w-full items-start gap-2 md:items-end md:gap-2.5 lg:gap-5"
      >
        <div className="cta-icon-wrap flex flex-1 shrink-0 items-center">
          <img src={ctaIcon} alt="" aria-hidden className="size-8 md:hidden" />
          <img
            src={ctaIconMd}
            alt=""
            aria-hidden
            className="hidden md:block lg:hidden md:size-14"
          />
          <img
            src={ctaIconLg}
            alt=""
            aria-hidden
            className="hidden lg:block lg:size-35"
          />
        </div>
        <span className="cta-title font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
          Request Access
        </span>
      </a>
    </section>
  )
}
