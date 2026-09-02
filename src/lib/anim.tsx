import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/*
  Примитивы для анимаций, заданных anim-токенами в именах слоёв Figma
  (см. ANIMATION-TOKENS.md и раздел «Анимации» в .claude/skills/figma-to-code).

  Покрывают: fade / slide / scale / blur-in на триггерах `in-view` и `load`,
  stagger между соседями, счётчик чисел (`count`).

  НЕ покрывают (нужен `motion` / GSAP, ставить по факту): scroll-скраб,
  parallax, pin — токены `trigger: scroll` и `anim: parallax|pin`.

  prefers-reduced-motion гасится глобально в src/index.css; счётчик
  дополнительно прыгает сразу к финальному значению.
*/

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export type RevealEffect =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'blur-in'

const OFFSET: Record<RevealEffect, (distance: number) => string> = {
  fade: () => 'none',
  'fade-up': (d) => `translateY(${d}px)`,
  'fade-down': (d) => `translateY(-${d}px)`,
  'fade-left': (d) => `translateX(${d}px)`,
  'fade-right': (d) => `translateX(-${d}px)`,
  scale: () => 'scale(0.92)',
  'blur-in': () => 'none',
}

/** cubic-bezier для `ease: out` — общий дефолт для reveal-эффектов. */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

export function useInView<T extends Element = HTMLElement>(
  opts: { once?: boolean; amount?: number } = {},
) {
  const { once = true, amount = 0.2 } = opts
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: amount },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, amount])

  return [ref, inView] as const
}

type RevealProps = {
  effect?: RevealEffect
  /** `in-view` — при попадании в вьюпорт (дефолт), `load` — сразу при монтировании. */
  trigger?: 'in-view' | 'load'
  delay?: number
  duration?: number
  /** сдвиг для slide-эффектов, px. */
  distance?: number
  once?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Reveal({
  effect = 'fade-up',
  trigger = 'in-view',
  delay = 0,
  duration = 600,
  distance = 24,
  once = true,
  className,
  style,
  children,
}: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ once })
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(true), [])

  const shown = trigger === 'load' ? loaded : inView

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : OFFSET[effect](distance),
        filter: shown
          ? 'none'
          : effect === 'blur-in'
            ? 'blur(12px)'
            : undefined,
        transition: [
          `opacity ${duration}ms ${EASE_OUT} ${delay}ms`,
          `transform ${duration}ms ${EASE_OUT} ${delay}ms`,
          `filter ${duration}ms ${EASE_OUT} ${delay}ms`,
        ].join(', '),
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Прокидывает нарастающую `delay` прямым детям — те появляются по очереди.
 * Дети должны принимать проп `delay` (например `<Reveal>`); собственная
 * задержка ребёнка складывается со staggered.
 */
export function Stagger({
  step = 80,
  start = 0,
  children,
}: {
  step?: number
  start?: number
  children: ReactNode
}) {
  return (
    <>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        const el = child as ReactElement<{ delay?: number }>
        return cloneElement(el, {
          delay: (el.props.delay ?? 0) + start + i * step,
        })
      })}
    </>
  )
}

/**
 * Счётчик числа от `start` до `target` при попадании в вьюпорт.
 * Возвращает [ref, value] — ref повесить на элемент с числом.
 */
export function useCounter(
  target: number,
  { duration = 1200, start = 0 }: { duration?: number; start?: number } = {},
) {
  const [ref, inView] = useInView<HTMLElement>({ once: true })
  const [value, setValue] = useState(start)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion()) {
      setValue(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, start])

  return [ref, value] as const
}
