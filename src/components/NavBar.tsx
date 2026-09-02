import navLogo from '../assets/nav-logo.svg'

const LEFT_LINKS = ['Experience', 'Spaces', 'About']
const RIGHT_LINKS = ['Blog', 'Contact', 'Book now']

export default function NavBar() {
  return (
    <header className="Nav fixed inset-x-0 top-0 z-50 flex items-center p-2.5 font-manrope text-dark lg:p-5">
      <div className="hidden w-full items-center justify-between lg:flex">
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
          <img src={navLogo} alt="State of Space" className="size-12" />
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
      </div>

      <div className="relative flex w-full items-center lg:hidden">
        <a href="#hero" className="Nav-logo absolute left-1/2 -translate-x-1/2">
          <img
            src={navLogo}
            alt="State of Space"
            className="size-10 md:size-12"
          />
        </a>

        <button
          type="button"
          className="Nav-menu-btn ml-auto whitespace-nowrap text-[0.875rem] font-medium tracking-[-0.03em] md:text-[1.125rem]"
        >
          Menu
        </button>
      </div>
    </header>
  )
}
