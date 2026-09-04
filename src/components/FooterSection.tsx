import footerLogo from '../assets/footer-logo.svg'

const NAV_LINKS = [
  'Experience',
  'Spaces',
  'About',
  'Blog',
  'Contact',
  'Book now',
]

type FooterSectionProps = {
  onBookNow: () => void
}

export default function FooterSection({ onBookNow }: FooterSectionProps) {
  return (
    <footer
      id="footer"
      className="Footer flex h-dvh w-full flex-col items-center justify-between bg-blue px-[0.625rem] pt-[3.75rem] pb-[1.25rem] font-manrope md:pt-[1rem] md:pb-[1rem] lg:px-[1.25rem] lg:pt-[2.5rem] lg:pb-[1.25rem]"
    >
      <nav className="Footer-nav flex w-full flex-col items-center gap-5 md:h-[1.375rem] md:flex-row md:justify-between md:gap-0 lg:h-[1.375rem]">
        {NAV_LINKS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={label === 'Book now' ? onBookNow : undefined}
            className="Footer-nav-link cursor-pointer whitespace-nowrap text-[0.875rem] font-medium tracking-[-0.03em] text-light transition-opacity duration-300 hover:opacity-70 md:text-[1.125rem] lg:text-[0.9375rem]"
          >
            {label}
          </button>
        ))}
      </nav>

      <a href="#hero" className="Footer-logo size-20 shrink-0 md:size-25">
        <img
          src={footerLogo}
          alt="State of Space"
          className="block size-full"
        />
      </a>

      <div className="Footer-bottom flex w-full flex-col items-center gap-5 text-[0.875rem] leading-none font-semibold tracking-[-0.01em] text-light/60 md:flex-row md:justify-between md:gap-0 lg:leading-[1.1]">
        <p className="Footer-copyright md:flex-1">© 2026. Ocean Space</p>
        <p className="Footer-terms md:flex-1 md:text-center">
          All rights reserved
        </p>
        <div className="Footer-bootm-links flex items-center justify-end gap-1 whitespace-nowrap text-right md:flex-1">
          <a href="#" className="hover:opacity-70">
            Terms
          </a>
          <span>/</span>
          <a href="#" className="hover:opacity-70">
            Privacy
          </a>
          <span>/</span>
          <a href="#" className="hover:opacity-70">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  )
}
