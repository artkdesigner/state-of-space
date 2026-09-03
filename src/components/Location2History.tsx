import historyPart1 from '../assets/location2/history-part-1.webp'

export default function Location2History() {
  return (
    <div className="Location2-history flex flex-col px-2.5 pt-2.5 pb-5 md:h-dvh md:w-max md:shrink-0 md:flex-row md:gap-2.5 md:p-2.5 lg:gap-0 lg:p-5">
      <div className="History-part-1 relative flex h-[51.5rem] w-full shrink-0 items-center justify-center overflow-hidden rounded-md md:h-full md:w-[47rem] lg:w-[120rem] lg:rounded-[1.875rem]">
        <img
          src={historyPart1}
          alt="Original 1988 architecture of The Island Retreat"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <p className="relative font-manrope text-[1.875rem] font-semibold whitespace-nowrap text-light md:text-[3.375rem] md:tracking-[-0.04em] lg:text-[8.375rem] lg:tracking-[-0.06em]">
          1988 — 2026
        </p>
      </div>

      <div className="History-part-2 flex shrink-0 flex-col justify-between gap-10 pt-5 font-manrope text-[0.875rem] tracking-[-0.01em] text-dark md:gap-0 md:pt-0 md:pl-2.5 lg:w-auto lg:pt-0 lg:pr-30 lg:pl-5 lg:text-[1.75rem] lg:tracking-[-0.02em]">
        <p className="leading-[1.3] font-medium lg:w-[38.75rem] lg:leading-[1.1] lg:font-semibold">
          The retreat is designed as a low, organic structure that seems to
          emerge from the land. Built with rammed earth, reclaimed wood
        </p>
        <p className="w-full leading-[1.3] font-medium md:w-[22.125rem] lg:w-[26.25rem] lg:text-[1.125rem] lg:tracking-[-0.01em]">
          Your day begins with a shoreline walk designed to stabilize breath and
          posture through natural terrain. Attention is directed toward weight
          distribution, air temperature, and contact with the ground. This is
          followed by tactile clay sessions using raw island materials. The
          practice emphasizes sensory feedback and hand movement to anchor
          attention in the body and restore cognitive balance.
        </p>
      </div>

      <div className="History-part-3 flex shrink-0 flex-col items-start gap-4 pt-30 font-manrope text-[1rem] tracking-[-0.02em] text-dark md:h-full md:w-[24.25rem] md:justify-center md:gap-5 md:py-2.5 lg:w-[51.25rem] lg:gap-5 lg:py-30 lg:text-[1.75rem]">
        <p className="leading-[1.1] font-medium lg:w-[38.75rem]">
          The architecture blends into the terrain rather than standing apart.
          Materials are selected for texture, thermal balance, and continuity
          with the island landscape, reinforcing physical grounding.
        </p>
        <div className="History-part-3-sub-wrap flex flex-col gap-2 text-[0.875rem] tracking-[-0.01em] text-dark/60 md:flex-row md:gap-2.5 lg:gap-5 lg:text-[1.125rem]">
          <p className="w-[18.75rem] leading-[1.3] font-medium md:w-auto md:flex-1 lg:w-[25rem] lg:flex-none">
            The Pool serves as the retreat&rsquo;s central element — a still
            body of water designed for slow immersion and sensory recalibration.
            Its temperature and depth are carefully adjusted to support
            relaxation without excess stimulation.
          </p>
          <p className="w-[18.75rem] leading-[1.3] font-medium md:w-auto md:flex-1 lg:w-[25rem] lg:flex-none">
            The Herbarium and kitchen extend this restorative logic — fresh
            island botanicals and plant-forward, locally sourced meals are
            curated to provide steady nourishment and balanced energy throughout
            the day.
          </p>
        </div>
      </div>
    </div>
  )
}
