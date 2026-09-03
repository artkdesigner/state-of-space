import img1 from '../assets/location2/pillars-img-1.webp'
import img2 from '../assets/location2/pillars-img-2.webp'
import img3 from '../assets/location2/pillars-img-3.webp'
import img4 from '../assets/location2/pillars-img-4.webp'
import img5 from '../assets/location2/pillars-img-5.webp'

type Pillar = {
  number: string
  title: string
  desc: [string, string]
  tight: boolean
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    title: 'Organic Synthesis',
    desc: ['Architecture that blends', 'and connects rather than defines.'],
    tight: true,
  },
  {
    number: '02',
    title: 'Sensory Reclamation',
    desc: [
      'Practices designed to return awareness to the body',
      'and the immediate environment.',
    ],
    tight: false,
  },
  {
    number: '03',
    title: 'Gentle Nourishment',
    desc: [
      'A focus on elemental, locally sourced sustenance',
      'for physical and energetic restoration.',
    ],
    tight: false,
  },
  {
    number: '04',
    title: 'Temporal Softness',
    desc: [
      'A schedule with open space, allowing for the natural,',
      'unrushed emergence of balance.',
    ],
    tight: true,
  },
]

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div
      className={`Pillars-card flex shrink-0 flex-col items-center justify-center gap-2.5 ${pillar.tight ? 'lg:gap-2.5' : 'lg:gap-5'}`}
    >
      <div className="Pillars-card-number-wrap flex size-10 shrink-0 items-center justify-center rounded-full border border-dark/30 lg:size-15">
        <p className="font-manrope text-xs text-dark/60 md:text-sm lg:text-[1.125rem]">
          {pillar.number}
        </p>
      </div>
      <div className="Pillars-card-content flex w-max flex-col items-center gap-2.5 text-center font-manrope text-[0.875rem] tracking-[-0.01em]">
        <p
          className={`whitespace-nowrap text-dark/60 lg:tracking-[-0.01em] ${pillar.tight ? 'lg:text-[2rem] lg:leading-[1.1]' : 'lg:text-[1.5rem] lg:leading-[0.9]'}`}
        >
          {pillar.title}
        </p>
        <p className="leading-[1.3] whitespace-nowrap text-dark lg:text-[1.125rem] lg:tracking-[-0.01em]">
          {pillar.desc[0]}
          <br />
          {pillar.desc[1]}
        </p>
      </div>
    </div>
  )
}

export default function Location2Pillars() {
  return (
    <div className="Location2-pillars flex flex-col items-center gap-10 px-2.5 py-15 md:h-dvh md:w-max md:shrink-0 md:flex-row md:justify-center md:gap-30 md:px-75 md:py-2.5 lg:gap-30 lg:justify-start lg:py-0 lg:pl-5 lg:pr-75">
      <p className="Pillars-title min-w-full shrink-0 text-center font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark md:min-w-0 md:w-auto md:text-left md:text-[3.375rem] md:leading-none lg:text-[8.375rem] lg:tracking-[-0.06em] lg:leading-none">
        <span className="md:block">Key Pillars</span>{' '}
        <span className="md:block">of the Stay</span>
      </p>

      <PillarCard pillar={PILLARS[0]} />

      <div className="Pillars-img-wrap-1 relative h-90 w-full shrink-0 md:h-65.5 md:w-65.5 lg:h-162.5 lg:w-162.5">
        <img
          src={img3}
          alt="Rammed-earth wall detail of The Island Retreat"
          loading="lazy"
          className="absolute top-[calc(50%-1.72rem)] left-[calc(50%-1.1875rem)] h-63.25 w-47.5 max-w-none -translate-x-1/2 -translate-y-1/2 rounded-md object-cover md:top-[calc(50%-1.3125rem)] md:left-[calc(50%-0.9375rem)] md:h-45 md:w-33 lg:top-[calc(50%-2.8125rem)] lg:left-[calc(50%-2.03875rem)] lg:h-112.5 lg:w-82.5 lg:rounded-[1.875rem]"
        />
        <img
          src={img2}
          alt="Still pool at The Island Retreat reflecting the surrounding pines"
          loading="lazy"
          className="absolute right-0 bottom-0 h-52 w-38.75 max-w-none rounded-md object-cover md:h-37.5 md:w-27.5 lg:h-92.5 lg:w-67.5 lg:rounded-[1.875rem]"
        />
        <img
          src={img1}
          alt=""
          loading="lazy"
          className="absolute top-0 left-0 size-25 max-w-none rounded-md object-cover md:size-18.5 lg:size-45 lg:rounded-[1.875rem]"
        />
      </div>

      <PillarCard pillar={PILLARS[1]} />
      <PillarCard pillar={PILLARS[2]} />

      <div className="Pillars-img-wrap-2 relative h-[15rem] w-full shrink-0 md:h-[8.625rem] md:w-[15.125rem] lg:h-[17.5rem] lg:w-[31.5625rem]">
        <img
          src={img5}
          alt="Herbarium terrace at The Island Retreat"
          loading="lazy"
          className="absolute top-[1.875rem] left-0 h-[13.125rem] w-[calc(100%-4rem)] max-w-none rounded-md object-cover md:top-[0.25rem] md:h-[8.3125rem] md:w-[calc(100%-2.625rem)] lg:top-0 lg:h-[17.5rem] lg:w-[calc(100%-5.3125rem)] lg:rounded-[1.875rem]"
        />
        <img
          src={img4}
          alt="Locally sourced meal served at The Island Retreat"
          loading="lazy"
          className="absolute top-0 left-[14.375rem] h-[9.625rem] w-[calc(100%-14.375rem)] max-w-none rounded-md object-cover md:top-[-1.25rem] md:left-[9.3125rem] md:h-[6.25rem] md:w-[calc(100%-9.3125rem)] lg:top-[-3.75rem] lg:left-[19.6875rem] lg:h-[12.875rem] lg:w-[11.875rem] lg:rounded-[1.875rem]"
        />
      </div>

      <PillarCard pillar={PILLARS[3]} />
    </div>
  )
}
