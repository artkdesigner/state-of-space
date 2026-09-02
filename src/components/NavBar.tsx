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

export default function NavBar() {
  return (
    <>
      {/* Desktop: белый текст + mix-blend-difference даёт автоконтраст на любом
          фоне под навбаром (приём из nordhaus.css). КРИТИЧНО: mix-blend-mode
          и position:fixed должны быть на ОДНОМ и том же элементе — если
          fixed стоит на обёртке, а blend на дочернем div, блендинг перестаёт
          видеть контент страницы, как только она становится скроллящейся
          (проверено эмпирически на этом же проекте). Поэтому здесь два
          независимых fixed-хедера, а не один хедер с двумя внутренними div. */}
      <header className="Nav fixed inset-x-0 top-0 z-50 hidden items-center justify-between p-5 font-manrope text-white mix-blend-difference lg:flex">
        {LEFT_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            className="Nav-link cursor-pointer whitespace-nowrap text-[0.9375rem] font-medium tracking-[-0.03em]"
          >
            {label}
          </button>
        ))}

        <a href="#hero" className="Nav-logo shrink-0">
          <NavLogo className="size-12" />
        </a>

        {RIGHT_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            className="Nav-link cursor-pointer whitespace-nowrap text-[0.9375rem] font-medium tracking-[-0.03em]"
          >
            {label}
          </button>
        ))}
      </header>

      <header className="Nav fixed inset-x-0 top-0 z-50 flex items-center p-2.5 font-manrope text-dark lg:hidden">
        <a href="#hero" className="Nav-logo absolute left-1/2 -translate-x-1/2">
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
