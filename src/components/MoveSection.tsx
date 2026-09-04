import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import autonomy from '../assets/move/autonomy.webp'
import buoyancy from '../assets/move/buoyancy.webp'
import freedom from '../assets/move/freedom.webp'

const CARDS = [
  { label: 'Autonomy', image: autonomy, crop: true },
  { label: 'Buoyancy', image: buoyancy },
  { label: 'Freedom', image: freedom },
]

/** Тот же приём вращения фоновых колец, что в CapacitySection. */
const ROTATE = '[transform-box:fill-box] [transform-origin:50%_50%]'

export default function MoveSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * CARDS.length,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(
          CARDS.length - 1,
          Math.floor(self.progress * CARDS.length),
        )
        setActiveIndex((prev) => (prev === index ? prev : index))
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id="move"
      ref={sectionRef}
      className="Move relative flex h-dvh w-full items-center justify-center overflow-hidden bg-light"
    >
      <svg
        aria-hidden
        className="Move-bg-img pointer-events-none absolute left-1/2 top-1/2 w-[68.75rem] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[87.5rem] lg:w-[141.875rem]"
        viewBox="0 0 2270 2088.89"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="moveCircle3Gradient"
            x1="1558.01"
            y1="393.084"
            x2="809.168"
            y2="1749.46"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#BAB2A9" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#BAB2A9" />
          </linearGradient>
          <linearGradient
            id="moveCircle2Gradient"
            x1="1933.24"
            y1="1116.6"
            x2="380.803"
            y2="806.936"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#BAB2A9" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#BAB2A9" />
          </linearGradient>
          <linearGradient
            id="moveCircle1Gradient"
            x1="1134.9"
            y1="285.426"
            x2="1134.9"
            y2="1803.76"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.131846" stopColor="#D8D0C7" />
            <stop offset="0.5" stopColor="#544F4C" />
            <stop offset="0.906408" stopColor="#D8D0C7" />
          </linearGradient>
        </defs>
        <path
          className={`${ROTATE} animate-[spin-slow_55s_linear_infinite]`}
          d="M997.795 322.369C1253.67 281.008 1534.46 333.057 1744.06 518.122C1906.36 661.43 1980.52 817.898 1990.7 973.846C2000.88 1129.8 1947.09 1285.29 1853.41 1426.63C1642.46 1744.9 1208.05 1945.79 757.255 1719.35C303.681 1491.53 208.631 1017.65 401.252 686.97C511.037 498.499 741.912 363.732 997.795 322.369Z"
          stroke="url(#moveCircle3Gradient)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow-reverse_40s_linear_infinite]`}
          d="M1814.18 622.702C1941.45 819.685 1984.7 1073.69 1872.31 1320.07C1785.28 1510.86 1655.48 1633.38 1504.59 1702.43C1353.69 1771.49 1181.66 1787.1 1010.17 1763.99C623.992 1711.96 278.645 1428.26 350.576 964.997C422.95 498.891 859.772 235.652 1252.05 267.599C1475.62 285.808 1686.9 425.712 1814.18 622.702Z"
          stroke="url(#moveCircle2Gradient)"
          strokeOpacity="0.8"
        />
        <path
          className={`${ROTATE} animate-[spin-slow_47.5s_linear_infinite]`}
          d="M658.881 490.107C838.734 333.435 1085.8 245.099 1344.78 304.587C1545.33 350.653 1683.37 449.76 1770.91 578.724C1858.45 707.696 1895.51 866.57 1894.03 1032.2C1890.69 1405.18 1651.96 1783.26 1182.47 1802.52C710.077 1821.89 393.721 1460.39 376.339 1085.45C366.432 871.757 479.02 646.787 658.881 490.107Z"
          stroke="url(#moveCircle1Gradient)"
          strokeOpacity="0.8"
        />
      </svg>

      <div className="Move-pin relative z-1 flex h-full w-full flex-col items-center justify-center gap-15 px-2.5 lg:gap-25">
        <div className="Move-title-wrap flex w-full flex-col items-center gap-4 text-center lg:w-[117.5rem] lg:gap-10">
          <h2 className="Move-title font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-dark md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
            Move with the Water
          </h2>
          <p className="Move-sub font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.00875rem] text-dark/60 md:w-[25.875rem] lg:w-[40.25rem] lg:text-[1.125rem] lg:tracking-[-0.01125rem]">
            Here, the destination is not the point — the movement itself is.
            Light glides across the surface, and with it, the perception of time
            begins to shift. The yacht becomes a vantage point over infinity.
            And within that widening horizon, a new sense of freedom emerges.
          </p>
        </div>

        <div className="Move-cards-wrap relative h-[13.6875rem] w-[12.5rem] overflow-hidden rounded-[0.5rem] md:h-[19.125rem] md:w-[17.5rem] md:rounded-[0.75rem] lg:h-[28.75rem] lg:w-[26.25rem] lg:rounded-[1.875rem]">
          {CARDS.map((card, i) => (
            <div
              key={card.label}
              className="Move-card absolute inset-0 flex flex-col justify-end overflow-hidden rounded-[0.5rem] bg-dark transition-transform duration-700 ease-out md:rounded-[0.75rem] lg:rounded-[1.875rem]"
              style={{
                zIndex: i,
                transform: `translateY(${i <= activeIndex ? '0%' : '100%'})`,
              }}
            >
              {card.crop ? (
                <img
                  src={card.image}
                  alt=""
                  className="absolute left-[-50.04%] top-[0.04%] h-full w-[149.98%] max-w-none object-cover"
                />
              ) : (
                <img
                  src={card.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              )}
              <div className="Move-card-footer relative flex items-center p-3 md:p-4 lg:p-10">
                <p className="font-manrope text-[1rem] leading-[1.1] font-medium tracking-[-0.02rem] text-light md:text-[1.125rem] md:tracking-[-0.0225rem] lg:text-[1.5rem] lg:leading-[0.9] lg:tracking-[-0.015rem]">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
