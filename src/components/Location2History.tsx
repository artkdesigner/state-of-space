import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import historyPart1 from '../assets/location2/history-part-1.webp'

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/** Экспериментальный параллакс History-part-1 на mobile/tablet — по
 * прямой просьбе пользователя ("попробуй, посмотрим что получится").
 * Ось параллакса — та, по которой контейнер РЕАЛЬНО едет мимо вьюпорта:
 *
 * - Mobile (< md) — Location2-history тут в обычном document flow (см.
 *   md:flex-row в родителе — до этой ширины горизонтальный трек ещё не
 *   активен), контейнер едет ВЕРТИКАЛЬНО обычным скроллом страницы —
 *   картинка сдвигается по Y.
 * - Tablet (md, не lg) — весь блок уже внутри горизонтально-скроллящегося
 *   пина Location2Section.tsx: контейнер стоит на месте по вертикали
 *   (Location2 сама приклеена), а едет мимо вьюпорта ПО ГОРИЗОНТАЛИ за
 *   счёт `gsap.set(track, { x: ... })` там же — вертикальный прогресс тут
 *   всегда 0, нужен именно горизонтальный сдвиг картинки.
 *
 * Меряем прогресс не через ScrollTrigger (его `start`/`end` строки вроде
 * 'top bottom' — только по вертикали, для горизонтального трека не
 * годятся), а напрямую через getBoundingClientRect() на каждый тик
 * gsap.ticker — читает уже применённую на этот кадр позицию независимо от
 * того, обычный это скролл или чужой JS-transform трека (тот же тик,
 * что двигает трек в Location2Section.tsx, уже отработал раньше — этот
 * эффект подписывается позже, см. порядок маунта в HomePage.tsx). */
export default function Location2History() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Насколько картинка перекрывает контейнер сверх его размера (по
    // обеим осям сразу, используем нужную по брейкпоинту) — доля от
    // размера контейнера, не абсолютный px, чтобы соотношение "запас
    // ⇄ амплитуда сдвига" оставалось одинаковым на любом экране.
    const OVERSHOOT_FRACTION = 0.14

    const isColumnLayoutRange = () => window.innerWidth < 992

    const measure = () => {
      const rect = container.getBoundingClientRect()
      if (isColumnLayoutRange()) {
        if (window.innerWidth < 768) {
          const overshoot = rect.height * OVERSHOOT_FRACTION
          img.style.height = `${rect.height + overshoot * 2}px`
          img.style.width = '100%'
          img.style.top = `${-overshoot}px`
          img.style.left = '0'
          return { overshoot, axis: 'y' as const }
        }
        const overshoot = rect.width * OVERSHOOT_FRACTION
        img.style.width = `${rect.width + overshoot * 2}px`
        img.style.height = '100%'
        img.style.left = `${-overshoot}px`
        img.style.top = '0'
        return { overshoot, axis: 'x' as const }
      }
      img.style.height = '100%'
      img.style.width = '100%'
      img.style.top = '0'
      img.style.left = '0'
      return { overshoot: 0, axis: null }
    }

    let { overshoot, axis } = measure()
    const onResize = () => {
      ;({ overshoot, axis } = measure())
    }
    window.addEventListener('resize', onResize)

    const tick = () => {
      if (!axis) {
        img.style.transform = ''
        return
      }
      const rect = container.getBoundingClientRect()
      const progress =
        axis === 'y'
          ? clamp(
              (window.innerHeight - rect.top) /
                (window.innerHeight + rect.height),
            )
          : clamp(
              (window.innerWidth - rect.left) /
                (window.innerWidth + rect.width),
            )
      const offset = (progress - 0.5) * 2 * overshoot
      img.style.transform =
        axis === 'y' ? `translateY(${offset}px)` : `translateX(${offset}px)`
    }
    gsap.ticker.add(tick)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      img.style.transform = ''
      img.style.height = ''
      img.style.width = ''
      img.style.top = ''
      img.style.left = ''
    }
  }, [])

  return (
    <div className="Location2-history flex flex-col px-2.5 pt-2.5 pb-5 md:h-dvh md:w-max md:shrink-0 md:flex-row md:gap-2.5 md:p-2.5 lg:gap-0 lg:p-5">
      <div
        ref={containerRef}
        className="History-part-1 relative flex h-[51.5rem] w-full shrink-0 items-center justify-center overflow-hidden rounded-md md:h-full md:w-[47rem] lg:mx-5 lg:w-[calc(100vw-2.5rem)] lg:rounded-[1.875rem]"
      >
        <img
          ref={imgRef}
          src={historyPart1}
          alt="Original 1988 architecture of The Island Retreat"
          className="absolute inset-0 size-full object-cover"
        />
        <p className="relative font-manrope text-[1.875rem] font-semibold whitespace-nowrap text-light md:text-[3.375rem] md:tracking-[-0.04em] lg:text-[8.375rem] lg:tracking-[-0.06em]">
          1988 — 2026
        </p>
      </div>

      <div className="History-part-2 flex shrink-0 flex-col justify-between gap-10 pt-5 font-manrope text-[0.875rem] tracking-[-0.01em] text-dark md:w-[22.75rem] md:gap-0 md:pt-0 md:pl-2.5 lg:w-auto lg:pt-0 lg:pr-30 lg:pl-5 lg:text-[1.75rem] lg:tracking-[-0.02em]">
        <p className="History-part-2-title mt-15 leading-[1.3] font-medium lg:w-[38.75rem] lg:leading-[1.1] lg:font-semibold">
          The retreat is designed as a low, organic structure that seems to
          emerge from the land. Built with rammed earth, reclaimed wood
        </p>
        <p className="w-full leading-[1.3] font-medium md:w-[22.125rem] lg:w-[26.25rem] lg:text-[1.125rem] lg:tracking-[-0.01em]">
          Your day begins with a shoreline walk designed to stabilize breath and
          posture through natural terrain. Attention is directed toward weight
          distribution, air temperature, and contact with the ground. This is
          followed by tactile clay sessions using raw island materials. The
          practice emphasizes sensory feedback and hand movement to anchor
          attention in the body and restore cognitive balance.
        </p>
      </div>

      <div className="History-part-3 flex shrink-0 flex-col items-start gap-4 pt-30 font-manrope text-[1rem] tracking-[-0.02em] text-dark md:h-full md:w-[24.25rem] md:justify-center md:gap-5 md:py-2.5 lg:w-[51.25rem] lg:gap-5 lg:py-30 lg:text-[1.75rem]">
        <p className="leading-[1.1] font-medium lg:w-[38.75rem]">
          The architecture blends into the terrain rather than standing apart.
          Materials are selected for texture, thermal balance, and continuity
          with the island landscape, reinforcing physical grounding.
        </p>
        <div className="History-part-3-sub-wrap flex flex-col gap-2 text-[0.875rem] tracking-[-0.01em] text-dark/60 md:gap-2.5 lg:flex-row lg:gap-5 lg:text-[1.125rem]">
          <p className="w-[18.75rem] leading-[1.3] font-medium md:w-full lg:w-[25rem] lg:flex-none">
            The Pool serves as the retreat&rsquo;s central element — a still
            body of water designed for slow immersion and sensory recalibration.
            Its temperature and depth are carefully adjusted to support
            relaxation without excess stimulation.
          </p>
          <p className="w-[18.75rem] leading-[1.3] font-medium md:w-full lg:w-[25rem] lg:flex-none">
            The Herbarium and kitchen extend this restorative logic — fresh
            island botanicals and plant-forward, locally sourced meals are
            curated to provide steady nourishment and balanced energy throughout
            the day.
          </p>
        </div>
      </div>
    </div>
  )
}
