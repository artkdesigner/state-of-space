import { useEffect, useState } from 'react'

function NavLogo({ className }: { className?: string }) {
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

/** Тема навбара по секции, под которой он сейчас проходит. */
const SECTION_THEMES: { id: string; theme: 'dark' | 'light' }[] = [
  { id: 'hero', theme: 'dark' },
  { id: 'intro', theme: 'light' },
  { id: 'location1', theme: 'light' },
  { id: 'cliff', theme: 'dark' },
  { id: 'qualities', theme: 'dark' },
  { id: 'capacity', theme: 'dark' },
  { id: 'presence', theme: 'dark' },
  { id: 'location3', theme: 'light' },
]

const THEME_CLASS = {
  dark: 'text-dark',
  light: 'text-light',
}

type NavBarProps = {
  onBookNow: () => void
}

export default function NavBar({ onBookNow }: NavBarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const themeById = new Map(
      SECTION_THEMES.map(({ id, theme }) => [id, theme]),
    )
    const trackedIds = [...SECTION_THEMES.map(({ id }) => id), 'footer']
    const sections = trackedIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    /** rootMargin схлопывает зону наблюдения в линию у самого верха
     * вьюпорта — секция считается активной, пока её граница проходит
     * через эту линию. Footer несёт собственную копию навигации, поэтому
     * над ним глобальный Nav прячется — иначе они дублируются. */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (entry.target.id === 'footer') {
              setHidden(true)
              continue
            }
            setHidden(false)
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
  const hiddenClass = hidden ? 'opacity-0 pointer-events-none' : ''

  return (
    <>
      <header
        className={`Nav fixed inset-x-0 top-0 z-50 hidden items-center justify-between p-5 font-manrope transition-[color,opacity] duration-500 lg:flex ${themeClass} ${hiddenClass}`}
      >
        {LEFT_LINKS.map((label) => (
          <button
            key={label}
            type="button"
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
            onClick={label === 'Book now' ? onBookNow : undefined}
            className="Nav-link cursor-pointer whitespace-nowrap text-[0.9375rem] font-medium tracking-[-0.03em] transition-opacity duration-300 hover:opacity-70"
          >
            {label}
          </button>
        ))}

        <a
          href="#hero"
          className="Nav-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <NavLogo className="size-12" />
        </a>
      </header>

      <header
        className={`Nav fixed inset-x-2.5 top-2.5 z-50 flex h-10 items-center font-manrope transition-[color,opacity] duration-500 md:h-12 lg:hidden ${themeClass} ${hiddenClass}`}
      >
        <a
          href="#hero"
          className="Nav-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <NavLogo className="size-10 md:size-12" />
        </a>

        <button
          type="button"
          className="Nav-menu-btn ml-auto whitespace-nowrap text-[0.875rem] font-medium tracking-[-0.03em] md:text-[1.125rem]"
        >
          Menu
        </button>
      </header>
    </>
  )
}
