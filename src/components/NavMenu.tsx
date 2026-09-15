import { useEffect, useState } from 'react'
import { lockScroll, scrollToHash, unlockScroll } from '../lib/scroll'
import { NavLogo } from './NavBar'
import Button from './Button'
import navMenuBg from '../assets/nav-menu-bg.webp'
import { scrollToIntroRevealed } from './IntroSection'
import {
  scrollToLocation2RetreatSlide,
  scrollToLocation3Slide,
} from './Location2Section'

const MENU_LINKS = ['The Cliff', 'The Island', 'The Water', 'About', 'Contact']
/** Тот же список и переходы, что в NavBar.tsx (по прямой просьбе
 * пользователя, 2026-09-14) — The Island/The Water через те же императивные
 * функции (Location2/Location3 лежат в горизонтально-скроллящемся пине,
 * см. комментарий там же), About — через scrollToIntroRevealed (см.
 * IntroSection.tsx: простой scrollToHash('#intro') целил в самое начало
 * её reveal-окна, где title/logo/bottom-wrap ещё не проявились), остальные
 * — простой scrollToHash. */
const LINK_ACTIONS: Record<string, () => void> = {
  'The Cliff': () => scrollToHash('#location1'),
  'The Island': () => scrollToLocation2RetreatSlide(0),
  'The Water': () => scrollToLocation3Slide(0),
  About: () => scrollToIntroRevealed(),
  Contact: () => scrollToHash('#footer'),
}

type NavMenuProps = {
  open: boolean
  onClose: () => void
  onBookNow: () => void
}

const TRANSITION_MS = 500

export default function NavMenu({ open, onClose, onBookNow }: NavMenuProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      )
      return () => cancelAnimationFrame(raf)
    }

    setVisible(false)
    const timeout = setTimeout(() => setMounted(false), TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [open])

  /* Завязано на `open`, а не `mounted` — иначе скролл (в т.ч. Lenis, см.
   * lockScroll) оставался залоченным ещё TRANSITION_MS после клика по
   * ссылке (mounted схлопывается только после closing-transition), и
   * scrollToHash/scrollToY, вызванные тем же кликом, попадали на ещё
   * остановленный Lenis и на `overflow: hidden` — переход визуально не
   * происходил вообще (баг, на который пожаловался пользователь: ссылки
   * в меню "не работают" на mobile/tablet). Меню остаётся видимым
   * (`mounted`) все те же TRANSITION_MS, просто фон уже можно скроллить
   * под ним. */
  useEffect(() => {
    if (!open) return
    lockScroll()
    return () => unlockScroll()
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div
      className={`Nav-menu fixed inset-0 z-100 flex flex-col items-center justify-between overflow-hidden p-2.5 transition-transform duration-500 ease-out will-change-transform lg:hidden ${
        visible ? '[transform:translateX(0%)]' : '[transform:translateX(100%)]'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div
        aria-hidden
        className="Nav-menu-bg absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={navMenuBg}
            alt=""
            className="absolute left-[-82.48%] top-[0.03%] h-full w-[235.81%] max-w-none object-cover"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.07) 19.434%), linear-gradient(180deg, rgba(0,0,0,0.1) 19.971%, rgb(0,0,0) 100%)',
          }}
        />
      </div>

      <div className="Nav-menu-header relative flex w-full flex-col items-center gap-10">
        <NavLogo className="size-10 text-light md:size-12" />
        <button
          type="button"
          onClick={onClose}
          className="Nav-menu-close absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap font-manrope text-[0.875rem] font-medium tracking-[-0.03em] text-light md:text-[1.125rem] md:tracking-[-0.03em]"
        >
          Close
        </button>
      </div>

      <div className="Nav-menu-middle relative flex h-95 w-75 shrink-0 flex-col items-center justify-center gap-6 rounded-[7.5rem] bg-overlay/30 p-6 text-center font-manrope font-semibold leading-[1.2] text-light backdrop-blur-[1.25rem] md:h-120 md:w-90 md:rounded-[8.75rem] md:px-7.5 md:py-15">
        {MENU_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              onClose()
              // Синхронный unlockScroll() ПЕРЕД самим переходом — onClose()
              // выше лишь ставит `open` в false, а связанный с ним эффект
              // (см. `useEffect(..., [open])` выше) отработает только на
              // следующем рендере React, ПОСЛЕ этого клика. Без этого вызова
              // scrollToHash/scrollToY ниже попадали на ещё залоченный
              // (Lenis stop() + overflow: hidden) скролл и молча не
              // срабатывали (баг, на который пожаловался пользователь:
              // "переходы по ссылкам из меню не работают"). unlockScroll()
              // безопасно вызвать второй раз (эффект всё равно позовёт его
              // же при закрытии) — счётчик клэмпится в 0, второй вызов
              // просто no-op.
              unlockScroll()
              LINK_ACTIONS[label]?.()
            }}
            className="Nav-menu-link cursor-pointer whitespace-nowrap text-[1.75rem] tracking-[-0.0525rem] transition-opacity duration-300 hover:opacity-70 md:text-[2.25rem] md:tracking-[-0.0675rem]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="Nav-menu-footer relative flex w-92.5 flex-col items-start gap-2.5 rounded-[2.5rem] bg-overlay/30 p-6 backdrop-blur-[1.25rem] md:w-90 md:p-7.5">
        <span className="font-manrope text-[0.75rem] font-semibold tracking-[-0.0075rem] text-light/60 md:text-[0.875rem] md:tracking-[-0.00875rem]">
          Booking
        </span>
        <div className="flex w-full items-end gap-5">
          <span className="flex-1 font-manrope text-[1.5rem] font-semibold uppercase leading-[0.9] tracking-[-0.045rem] text-light md:text-[1.75rem] md:tracking-[-0.0525rem]">
            Choose
            <br />
            the Space
          </span>
          <Button variant="light" onClick={onBookNow}>
            Book now
          </Button>
        </div>
      </div>
    </div>
  )
}
