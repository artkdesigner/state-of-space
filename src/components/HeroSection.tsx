import heroPortrait from '../assets/hero-portrait-b.webp'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="Hero relative flex min-h-dvh flex-col items-center justify-center border-b border-dark bg-light p-[clamp(0.625rem,0.4657rem+0.6536vw,1.25rem)]"
    >
      <h1 className="grid w-full grid-cols-1 items-center justify-items-center gap-[clamp(1.25rem,-0.0397rem+5.291vw,2.5rem)] font-manrope font-semibold uppercase leading-none tracking-[-0.04em] text-dark lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
        <span className="Hero-text-left whitespace-nowrap text-[clamp(2rem,0.7574rem+5.098vw,6.875rem)] lg:justify-self-start lg:text-[clamp(2.25rem,-3.0357rem+8.25893vw,6.875rem)]">
          III spaces
        </span>

        <span className="Hero-img relative block aspect-square w-[clamp(21.25rem,10.9325rem+42.328vw,31.25rem)] shrink-0 overflow-hidden rounded-full">
          <img
            src={heroPortrait}
            alt="A woman standing on a coastal cliff at sunset, her dress caught by the wind"
            fetchPriority="high"
            className="size-full object-cover"
          />
        </span>

        <span className="Hero-text-right whitespace-nowrap text-[clamp(2rem,0.7574rem+5.098vw,6.875rem)] lg:justify-self-end lg:text-[clamp(2.25rem,-3.0357rem+8.25893vw,6.875rem)]">
          III states
        </span>
      </h1>

      <p className="Hero-subtitle absolute bottom-[clamp(2.125rem,1.9975rem+0.5229vw,2.625rem)] left-1/2 w-[clamp(17.625rem,15.4265rem+9.0196vw,26.25rem)] -translate-x-1/2 translate-y-1/2 text-center text-[clamp(0.875rem,0.7083rem+0.3472vw,1.125rem)] font-medium leading-[1.3] tracking-[-0.01em] text-dark/60">
        A quiet return to yourself.
        <br />
        Shaped by space, rhythm, and presence.
      </p>
    </section>
  )
}
