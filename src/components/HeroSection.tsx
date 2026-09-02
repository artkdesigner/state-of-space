import heroPortrait from '../assets/hero-portrait-b.webp'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="Hero relative flex min-h-dvh flex-col items-center justify-center border-b border-dark bg-light p-2.5 lg:p-5"
    >
      <h1 className="grid w-full grid-cols-1 items-center justify-items-center gap-5 font-manrope font-semibold uppercase leading-none tracking-[-0.04em] text-dark md:gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
        <span className="Hero-text-left whitespace-nowrap text-[2rem] md:text-[3.4375rem] lg:justify-self-start lg:text-[6.875rem]">
          III spaces
        </span>

        <span className="Hero-img relative block aspect-square w-85 shrink-0 overflow-hidden rounded-full md:w-125">
          <img
            src={heroPortrait}
            alt="A woman standing on a coastal cliff at sunset, her dress caught by the wind"
            fetchPriority="high"
            className="size-full object-cover"
          />
        </span>

        <span className="Hero-text-right whitespace-nowrap text-[2rem] md:text-[3.4375rem] lg:justify-self-end lg:text-[6.875rem]">
          III states
        </span>
      </h1>

      <p className="Hero-subtitle absolute bottom-[2.125rem] left-1/2 w-70.5 -translate-x-1/2 translate-y-1/2 text-center text-[0.875rem] font-medium leading-[1.3] tracking-[-0.01em] text-dark/60 md:bottom-[2.3125rem] md:w-65 lg:bottom-[2.625rem] lg:w-105 lg:text-[1.125rem]">
        A quiet return to yourself.
        <br />
        Shaped by space, rhythm, and presence.
      </p>
    </section>
  )
}
