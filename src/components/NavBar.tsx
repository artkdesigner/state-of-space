import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { reduceMotion } from '../lib/anim'
import { HERO_INTRO } from '../lib/heroIntro'
import { scrollToHash } from '../lib/scroll'
import NavMenu from './NavMenu'

export function NavLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M48 48H0V0H48V48ZM38.1426 9.85742C30.3321 2.04694 17.6679 2.04694 9.85742 9.85742C2.04739 17.6679 2.04713 30.3313 9.85742 38.1416C17.6679 45.9521 30.3321 45.9521 38.1426 38.1416C45.9529 30.3313 45.9526 17.6679 38.1426 9.85742ZM10.2109 10.2109C16.0688 4.35309 26.9912 5.77739 34.6064 13.3926C42.2216 21.0078 43.6469 31.9302 37.7891 37.7881C31.9312 43.646 21.0088 42.2207 13.3936 34.6055C5.77856 26.9904 4.3536 16.0689 10.2109 10.2109Z"
        fill="currentColor"
      />
    </svg>
  )
}

const LEFT_LINKS = ['Experience', 'Spaces', 'About']
const RIGHT_LINKS = ['Blog', 'Contact', 'Book now']

/** Ссылки-переходы к секциям — по прямой просьбе пользователя (остальные
 * пункты (Spaces/About/Blog) по-прежнему плейсхолдеры без действия, см.
 * memory). Тот же `scrollToHash`, что уже используется для лого/`#hero`. */
const LINK_HASHES: Record<string, string> = {
  Experience: '#intro',
  Spaces: '#location1',
  Contact: '#footer',
}

/** Тема навбара по секции, под которой он сейчас проходит. Сам переход
 * hero→intro (пока Hero-оверлей ещё разворачивается) — скролл-driven, ту
 * часть ставит `setNavTheme` из HeroSection.tsx, не этот наблюдатель;
 * `intro` здесь — лишь подстраховка на момент, когда Intro-wrap уже
 * коснулась верха экрана (та же тема, что и целевая у HeroSection к концу
 * её собственного unwind, но не завязанная на то, что тот триггер
 * действительно успел отработать). */
const SECTION_THEMES: { id: string; theme: 'dark' | 'light' }[] = [
  { id: 'hero', theme: 'dark' },
  { id: 'intro', theme: 'light' },
  { id: 'location1', theme: 'light' },
  { id: 'cliff', theme: 'dark' },
  { id: 'qualities', theme: 'dark' },
  { id: 'above', theme: 'light' },
  { id: 'capacity', theme: 'dark' },
  { id: 'presence', theme: 'dark' },
  { id: 'location3', theme: 'dark' },
  { id: 'residence', theme: 'light' },
  { id: 'advantages', theme: 'light' },
  { id: 'beyond', theme: 'light' },
  { id: 'move', theme: 'dark' },
  { id: 'drift', theme: 'dark' },
]

const THEME_CLASS = {
  dark: 'text-dark',
  light: 'text-light',
}

type NavBarProps = {
  onBookNow: () => void
}

/** Императивный сеттер темы навбара для скролл-driven переходов, которые
 * не вписываются в SECTION_THEMES (см. HeroSection → Intro). */
let externalSetTheme: ((theme: 'dark' | 'light') => void) | null = null
export function setNavTheme(theme: 'dark' | 'light') {
  externalSetTheme?.(theme)
}

export default function NavBar({ onBookNow }: NavBarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const desktopHeaderRef = useRef<HTMLElement>(null)
  const mobileHeaderRef = useRef<HTMLElement>(null)

  useEffect(() => {
    externalSetTheme = setTheme
    return () => {
      externalSetTheme = null
    }
  }, [])

  /* Интро: навбар приезжает сверху — см. src/lib/heroIntro.ts.
   * useLayoutEffect, чтобы скрытое стартовое состояние применилось до
   * первой отрисовки, без вспышки полностью видимого навбара. */
  useLayoutEffect(() => {
    const headers = [desktopHeaderRef.current, mobileHeaderRef.current].filter(
      (el): el is HTMLElement => el !== null,
    )
    if (headers.length === 0) return

    if (reduceMotion()) {
      gsap.set(headers, { yPercent: 0 })
      return
    }

    const tween = gsap.fromTo(
      headers,
      { yPercent: -100 },
      {
        yPercent: 0,
        duration: HERO_INTRO.nav.duration,
        ease: HERO_INTRO.nav.ease,
      },
    )
    return () => {
      tween.kill()
    }
  }, [])

  useEffect(() => {
    const themeById = new Map(
      SECTION_THEMES.map(({ id, theme }) => [id, theme]),
    )
    const sections = SECTION_THEMES.map(({ id }) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null)

    /** rootMargin схлопывает зону наблюдения в линию у самого верха
     * вьюпорта — секция считается активной, пока её граница проходит
     * через эту линию. */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionTheme = themeById.get(entry.target.id)
            if (sectionTheme) setTheme(sectionTheme)
          }
        }
      },
      { rootMargin: '0px 0px -100% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const themeClass = THEME_CLASS[theme]

  return (
    <>
      <header
        ref={desktopHeaderRef}
        className={`Nav fixed inset-x-0 top-0 z-50 hidden items-center justify-between p-5 font-manrope transition-colors duration-500 lg:flex ${themeClass}`}
      >
        {LEFT_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={
              LINK_HASHES[label]
                ? () => scrollToHash(LINK_HASHES[label])
                : undefined
            }
            className="Nav-link cursor-pointer whitespace-nowrap text-[0.9375rem] font-medium tracking-[-0.03em] transition-opacity duration-300 hover:opacity-70"
          >
            {label}
          </button>
        ))}

        {/* Занимает место в потоке наравне с остальными ссылками, чтобы
         * гэпы между ними не менялись, но сам логотип не рисует — реальный
         * логотип наложен абсолютом по центру ниже, т.к. justify-between
         * центрирует его только по гэпам, а не по пикселям (сумма ширин
         * текста слева и справа разная — лого визуально уезжало). */}
        <span className="Nav-logo-spacer size-12 shrink-0" aria-hidden />

        {RIGHT_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={
              label === 'Book now'
                ? onBookNow
                : LINK_HASHES[label]
                  ? () => scrollToHash(LINK_HASHES[label])
                  : undefined
            }
            className="Nav-link cursor-pointer whitespace-nowrap text-[0.9375rem] font-medium tracking-[-0.03em] transition-opacity duration-300 hover:opacity-70"
          >
            {label}
          </button>
        ))}

        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            scrollToHash('#hero')
          }}
          className="Nav-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <NavLogo className="size-12" />
        </a>
      </header>

      <header
        ref={mobileHeaderRef}
        className={`Nav fixed inset-x-2.5 top-2.5 z-50 flex h-10 items-center font-manrope transition-colors duration-500 md:h-12 lg:hidden ${themeClass}`}
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            scrollToHash('#hero')
          }}
          className="Nav-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <NavLogo className="size-10 md:size-12" />
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="Nav-menu-btn ml-auto cursor-pointer whitespace-nowrap text-[0.875rem] font-medium tracking-[-0.03em] md:text-[1.125rem]"
        >
          Menu
        </button>
      </header>

      <NavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onBookNow={onBookNow}
      />
    </>
  )
}
