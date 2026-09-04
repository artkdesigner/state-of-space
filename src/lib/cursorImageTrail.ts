import { useEffect, useRef, type RefObject } from 'react'

type Options = {
  /** Мин. расстояние в px, которое должен пройти курсор, чтобы включилась следующая картинка. */
  minDistance?: number
  /** Сколько мс картинка остаётся видимой, прежде чем погаснуть. */
  visibleDuration?: number
}

/**
 * Классический cursor image trail: пул картинок по очереди появляется у
 * курсора и гаснет по мере его движения. Активен только на десктопе
 * (>= lg, 992px в этом проекте) и выключен при prefers-reduced-motion — на
 * планшете/мобильном эффект не подключается вовсе, картинки остаются в
 * статичных позициях из макета.
 */
export function useCursorImageTrail<T extends HTMLElement>(
  containerRef: RefObject<HTMLElement | null>,
  count: number,
  { minDistance = 80, visibleDuration = 700 }: Options = {},
) {
  const itemRefs = useRef<(T | null)[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(min-width: 62rem)').matches) return

    let activeIndex = -1
    let lastX = 0
    let lastY = 0
    let hasLast = false
    const hideTimers: number[] = []

    const showAt = (i: number, x: number, y: number) => {
      const el = itemRefs.current[i]
      if (!el) return
      el.style.transform = `translate3d(${x - el.offsetWidth / 2}px, ${y - el.offsetHeight / 2}px, 0)`
      el.style.opacity = '1'
      window.clearTimeout(hideTimers[i])
      hideTimers[i] = window.setTimeout(() => {
        el.style.opacity = '0'
      }, visibleDuration)
    }

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const moved = !hasLast || Math.hypot(x - lastX, y - lastY) >= minDistance
      if (!moved) return

      hasLast = true
      lastX = x
      lastY = y
      activeIndex = (activeIndex + 1) % count
      showAt(activeIndex, x, y)
    }

    container.addEventListener('mousemove', onMove)
    return () => {
      container.removeEventListener('mousemove', onMove)
      hideTimers.forEach((t) => window.clearTimeout(t))
    }
  }, [containerRef, count, minDistance, visibleDuration])

  return (i: number) => (el: T | null) => {
    itemRefs.current[i] = el
  }
}
