import { useEffect, useState } from 'react'
import { getLenis } from '../lib/scroll'
import { NavLogo } from './NavBar'
import Button from './Button'
import navMenuBg from '../assets/nav-menu-bg.webp'

const MENU_LINKS = ['Experience', 'Spaces', 'Contact']

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

  useEffect(() => {
    if (!mounted) return

    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()

    return () => {
      document.documentElement.style.overflow = ''
      getLenis()?.start()
    }
  }, [mounted])

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
      className={`Nav-menu fixed inset-0 z-100 flex origin-center flex-col items-center justify-between overflow-hidden p-2.5 transition-[transform,opacity] duration-500 ease-out lg:hidden ${
        visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
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
          className="Nav-menu-close absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap font-manrope text-[0.875rem] font-medium tracking-[-0.03em] text-light md:text-[1.125rem] md:tracking-[-0.03em]"
        >
          Close
        </button>
      </div>

      <div className="Nav-menu-middle relative flex h-95 w-75 shrink-0 flex-col items-center justify-center gap-6 rounded-[7.5rem] bg-overlay/30 p-6 text-center font-manrope font-semibold leading-[1.2] text-light backdrop-blur-[1.25rem] md:h-120 md:w-90 md:rounded-[8.75rem] md:px-7.5 md:py-15">
        {MENU_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={onClose}
            className="Nav-menu-link cursor-pointer whitespace-nowrap text-[1.75rem] tracking-[-0.0525rem] transition-opacity duration-300 hover:opacity-70 md:text-[2.25rem] md:tracking-[-0.0675rem]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="Nav-menu-footer relative flex w-full flex-col items-start gap-2.5 rounded-[2.5rem] bg-overlay/30 p-6 backdrop-blur-[1.25rem] md:p-7.5">
        <span className="font-manrope text-[0.75rem] font-semibold tracking-[-0.0075rem] text-light/60 md:text-[0.875rem] md:tracking-[-0.00875rem]">
          Booking
        </span>
        <div className="flex w-full items-end gap-5">
          <span className="flex-1 font-manrope text-[1.5rem] font-semibold uppercase leading-[0.9] tracking-[-0.045rem] text-light md:text-[1.75rem] md:tracking-[-0.0525rem]">
            Choose
            <br />
            the Space
          </span>
          <Button
            variant="light"
            onClick={() => {
              onClose()
              onBookNow()
            }}
          >
            Book now
          </Button>
        </div>
      </div>
    </div>
  )
}
