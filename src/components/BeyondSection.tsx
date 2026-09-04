import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import img0 from '../assets/beyond/00.webp'
import img1 from '../assets/beyond/01.webp'
import img2 from '../assets/beyond/02.webp'
import img3 from '../assets/beyond/03.webp'
import img4 from '../assets/beyond/04.webp'
import img5 from '../assets/beyond/05.webp'
import img6 from '../assets/beyond/06.webp'
import img7 from '../assets/beyond/07.webp'
import img8 from '../assets/beyond/08.webp'
import img9 from '../assets/beyond/09.webp'
import img10 from '../assets/beyond/10.webp'
import img11 from '../assets/beyond/11.webp'
import img12 from '../assets/beyond/12.webp'
import img13 from '../assets/beyond/13.webp'
import img14 from '../assets/beyond/14.webp'
import img15 from '../assets/beyond/15.webp'
import img16 from '../assets/beyond/16.webp'
import img17 from '../assets/beyond/17.webp'
import img18 from '../assets/beyond/18.webp'
import img19 from '../assets/beyond/19.webp'
import img20 from '../assets/beyond/20.webp'
import img21 from '../assets/beyond/21.webp'
import img22 from '../assets/beyond/22.webp'
import img23 from '../assets/beyond/23.webp'

const IMAGES = [
  img0,
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
  img14,
  img15,
  img16,
  img17,
  img18,
  img19,
  img20,
  img21,
  img22,
  img23,
]

/** Высота скролла, за которую кольцо делает один полный оборот. */
const PIN_HEIGHT_VH = 400

/**
 * top/left/size — % от квадратного контейнера Beyond-carousel (это уже
 * ограничивающий квадрат повёрнутой картинки, взят напрямую из Figma).
 * rotate — угол поворота карточки, deg. tint — тёмная плашка поверх фото.
 */
const ITEMS: {
  top: number
  left: number
  size: number
  rotate: number
  image: number
  tint?: boolean
}[] = [
  { top: 26.08, left: 2.38, size: 12.28, rotate: -66.81, image: 1 },
  { top: 61.63, left: 85.32, size: 12.27, rotate: -66.81, image: 2 },
  { top: 15.53, left: 7.97, size: 13.13, rotate: -51.81, image: 3 },
  { top: 71.33, left: 78.88, size: 13.13, rotate: -51.81, image: 4 },
  { top: 7.32, left: 16.42, size: 13.09, rotate: -36.81, image: 5 },
  { top: 79.57, left: 70.47, size: 13.09, rotate: -36.81, image: 6 },
  { top: 2.03, left: 27.16, size: 12.15, rotate: -21.81, image: 7 },
  { top: 85.8, left: 60.67, size: 12.15, rotate: -21.81, image: 8 },
  { top: 0, left: 39.45, size: 10.39, rotate: -6.81, image: 9 },
  { top: 89.59, left: 50.14, size: 10.39, rotate: -6.81, image: 10 },
  { top: 0.05, left: 51.13, size: 10.59, rotate: 8.19, image: 11 },
  { top: 89.35, left: 38.26, size: 10.59, rotate: 8.19, image: 12 },
  { top: 2.39, left: 61.62, size: 12.28, rotate: 23.19, image: 13 },
  { top: 85.32, left: 26.08, size: 12.28, rotate: 23.19, image: 14 },
  { top: 7.97, left: 71.32, size: 13.13, rotate: 38.19, image: 14 },
  { top: 78.88, left: 15.53, size: 13.13, rotate: 38.19, image: 15 },
  { top: 16.42, left: 79.57, size: 13.09, rotate: 53.19, image: 16 },
  { top: 70.47, left: 7.33, size: 13.08, rotate: 53.19, image: 17 },
  { top: 27.16, left: 85.8, size: 12.16, rotate: 68.19, image: 18, tint: true },
  { top: 60.67, left: 2.03, size: 12.15, rotate: 68.19, image: 19 },
  {
    top: 39.45,
    left: 89.59,
    size: 10.39,
    rotate: 83.19,
    image: 20,
    tint: true,
  },
  { top: 50.14, left: 0, size: 10.39, rotate: 83.19, image: 21 },
  { top: 51.13, left: 89.35, size: 10.59, rotate: 98.19, image: 22 },
  { top: 38.27, left: 0.05, size: 10.58, rotate: 98.19, image: 23 },
]

/** Ребро квадратной картинки в % от её же повёрнутого ограничивающего квадрата. */
function innerEdgePercent(rotateDeg: number) {
  const rad = (rotateDeg * Math.PI) / 180
  return 100 / (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)))
}

export default function BeyondSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (PIN_HEIGHT_VH / 100),
      pin: true,
      scrub: true,
      onUpdate: (self) => setRotation(self.progress * 360),
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id="beyond"
      ref={sectionRef}
      className="Beyond relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-blue"
    >
      <p className="Beyond-title relative z-1 text-center font-manrope text-[1.875rem] leading-none font-semibold tracking-[-0.075rem] text-light md:text-[3.375rem] md:tracking-[-0.135rem] lg:text-[8.375rem] lg:tracking-[-0.5025rem]">
        Beyond the
        <br />
        Usual Life
      </p>

      <div className="Beyond-carousel absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 md:size-[59rem] lg:top-30 lg:size-[118rem] lg:translate-y-0">
        <div
          className="Beyond-carousel-spin absolute inset-0"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {ITEMS.map((item, i) => {
            const edge = innerEdgePercent(item.rotate)
            return (
              <div
                key={i}
                className="Beyond-carousel-img absolute"
                style={{
                  top: `${item.top}%`,
                  left: `${item.left}%`,
                  width: `${item.size}%`,
                  height: `${item.size}%`,
                }}
              >
                <div
                  className="absolute overflow-hidden rounded-[0.9375rem] lg:rounded-[1.8388rem]"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: `${edge}%`,
                    height: `${edge}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                  }}
                >
                  <img
                    src={IMAGES[item.image]}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                  {item.tint && (
                    <div className="absolute inset-0 bg-dark/30" aria-hidden />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
