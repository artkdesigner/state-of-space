import gsap from 'gsap'
import { reduceMotion } from './anim'

/*
  Тайминг интро-анимации Hero (навбар сверху → Hero-img scale 0→100% →
  побуквенный Hero-text-left/right → Hero-subtitle снизу), собранной по
  покадровой сцене из 6 фреймов в Figma. Общий источник правды для
  NavBar.tsx и HeroSection.tsx, которые монтируются независимо, поэтому
  синхронизация — через общие delay/duration, а не единый GSAP timeline.
*/

const NAV_DURATION = 1.2
const NAV_EASE = 'power3.out'

const IMG_DURATION = 2.4
const IMG_EASE = 'power2.out'
/** Hero-img стартует, когда навбар долетел до места. */
const IMG_DELAY = NAV_DURATION

/** Hero-text-left стартует на 30% прогресса Hero-img (см. фрейм 3 сцены). */
const TEXT_LEFT_START_RATIO = 0.3
/** Hero-text-left печатается целиком за 40% длительности Hero-img. */
const TEXT_LEFT_DURATION_RATIO = 0.4

/** Момент, когда Hero-img докрастает до 100% — общий финиш для img/text-right. */
const HERO_END = IMG_DELAY + IMG_DURATION

const TEXT_LEFT_DELAY = IMG_DELAY + TEXT_LEFT_START_RATIO * IMG_DURATION
const TEXT_LEFT_DURATION = TEXT_LEFT_DURATION_RATIO * IMG_DURATION

/** Hero-text-right стартует только когда Hero-text-left уже допечатан
 * целиком (последовательно, не параллельно), и заканчивает вместе с
 * Hero-img. */
const TEXT_RIGHT_DELAY = TEXT_LEFT_DELAY + TEXT_LEFT_DURATION
const TEXT_RIGHT_DURATION = HERO_END - TEXT_RIGHT_DELAY

/** Hero-subtitle выезжает снизу только после того, как img/text закончили. */
const SUBTITLE_DELAY = HERO_END
const SUBTITLE_DURATION = 0.7
const SUBTITLE_EASE = 'power3.out'

export const HERO_INTRO = {
  nav: { duration: NAV_DURATION, ease: NAV_EASE },
  img: { delay: IMG_DELAY, duration: IMG_DURATION, ease: IMG_EASE },
  textLeft: { delay: TEXT_LEFT_DELAY, duration: TEXT_LEFT_DURATION },
  textRight: { delay: TEXT_RIGHT_DELAY, duration: TEXT_RIGHT_DURATION },
  subtitle: {
    delay: SUBTITLE_DELAY,
    duration: SUBTITLE_DURATION,
    ease: SUBTITLE_EASE,
  },
}

/**
 * Побуквенный reveal детей с классом `Hero-text-span` внутри `container` —
 * укладывается ровно в `duration`, стартует через `delay`. При
 * `prefers-reduced-motion` буквы показываются сразу, без анимации.
 */
export function typeReveal(
  container: Element | null,
  { delay, duration }: { delay: number; duration: number },
) {
  if (!container) return
  const chars = container.querySelectorAll<HTMLElement>('.Hero-text-span')
  if (chars.length === 0) return

  if (reduceMotion()) {
    gsap.set(chars, { opacity: 1 })
    return
  }

  const charDuration = Math.min(0.05, duration / chars.length)
  const stagger =
    chars.length > 1 ? (duration - charDuration) / (chars.length - 1) : 0

  return gsap.fromTo(
    chars,
    { opacity: 0 },
    { opacity: 1, duration: charDuration, ease: 'none', stagger, delay },
  )
}
