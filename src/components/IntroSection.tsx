import introLogo from '../assets/intro-logo.svg'

export default function IntroSection() {
  return (
    <section
      id="intro"
      className="flex min-h-dvh flex-col items-center justify-between bg-brown px-[clamp(0.625rem,0.2083rem+0.8681vw,1.25rem)] py-[clamp(3.75rem,1.25rem+5.208vw,7.5rem)] text-light"
    >
      <h2 className="mx-auto max-w-[1504px] text-center font-manrope text-[clamp(1.25rem,0.6128rem+2.6144vw,3.75rem)] font-semibold leading-[1.2] tracking-[-0.03em]">
        Live a unique experience inspired by the natural rhythm of the ocean. An
        experience where the important thing is not a change of scenery, but the
        inner sensation.
      </h2>

      <img src={introLogo} alt="State of Space" className="size-[100px]" />

      <div className="grid w-full grid-cols-1 items-start gap-5 font-manrope text-[clamp(0.875rem,0.7083rem+0.3472vw,1.125rem)] font-medium leading-[1.3] tracking-[-0.01em] text-light/60 md:grid-cols-[1fr_auto_1fr]">
        <p className="order-1 whitespace-nowrap md:order-none md:text-left">
          Ocean Space
        </p>
        <p className="order-3 mx-auto max-w-[604px] text-center md:order-none">
          Inspired by ocean landscapes and minimalist architecture, the project
          examines how spatial design influences focus, perception, and
          cognitive balance. Natural elements are used intentionally - to
          simplify, slow down, and clarify experience.
        </p>
        <p className="order-2 whitespace-nowrap text-center md:order-none md:text-right">
          2026
        </p>
      </div>
    </section>
  )
}
