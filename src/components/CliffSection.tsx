import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reduceMotion } from '../lib/anim'
import cliff1 from '../assets/cliff-1.webp'
import cliff2 from '../assets/cliff-2.webp'
import cliff3 from '../assets/cliff-3.webp'
import cliff4 from '../assets/cliff-4.webp'
import cliff5 from '../assets/cliff-5.webp'

const IMAGE_RADIUS =
  'overflow-hidden rounded-[0.5625rem] md:rounded-[0.9375rem] lg:rounded-[1.875rem]'

/** Первые RISE_VH вьюпорта СОБСТВЕННОЙ (уже приклеенной, см. wrapTop ниже)
 * sticky-фазы Cliff — НЕ отдельный riseTrigger до wrapTop, как раньше. По
 * структуре обёрток (Location1-wrap кончается вплотную к Cliff-wrap, у
 * обоих margin-top: -100vh) Location1 отклеивается и естественным document
 * flow уезжает вверх РОВНО в тот момент, когда Cliff сама встаёт на sticky
 * (см. Location1Section.tsx: её `(2 + PIN_VH)` — тот же самый момент, что
 * `wrapTop()` здесь, совпадение не случайное и не требует синхронизации
 * JS'ом). Раньше здесь стоял riseTrigger ДО wrapTop — в его окне Location1
 * ещё гарантированно не отклеилась (это случается только в конце окна), а
 * сама Cliff, тоже ещё не приклеенная, в этот момент физически въезжала
 * снизу как обычный doc-flow блок — баг, на который пожаловался
 * пользователь: Location1 стоит на месте, а Cliff вместо этого едет снизу,
 * хотя должно быть наоборот. Перенос фазы на ПОСЛЕ wrapTop чинит оба
 * симптома сразу: здесь Cliff уже стоит на месте (sticky), а Location1 уже
 * гарантированно отклеена и едет вверх сама, без единой строчки JS на её
 * позицию — скругление нижних углов Location1 (см. departTrigger ниже)
 * просто синхронизировано с этим уже идущим отъездом. Это окно —
 * ИСКЛЮЧИТЕЛЬНО про отъезд Location1, содержимое самого Cliff (title/
 * картинки) в нём больше не трогается (см. FADE_VH ниже) — по жалобе
 * пользователя они начинали проявляться прямо во время этого отъезда,
 * когда Location1 ещё не скрылась за верхним краем экрана. */
const RISE_VH = 1
/** Cliff-title начинает проявляться из прозрачности только ПОСЛЕ RISE_VH
 * — то есть только когда Location1 уже гарантированно полностью скрылась
 * за верхним краем экрана (см. RISE_VH выше), а не одновременно с её
 * отъездом, как было раньше. Долгота окна — тот же 1 вьюпорт, что и раньше
 * был у fade внутри RISE_VH, просто целиком сдвинутый на RISE_VH позже.
 * Картинки в этом окне больше не участвуют — см. TITLE_FADE_WINDOW ниже. */
const FADE_VH = 1
/** Собственная (внутренняя) хореография Cliff — title уходит вверх и
 * пропадает за кадром, sub-title/description въезжают с боков, 5 фото
 * сходятся в стопку по центру — пока Cliff приклеена вверху, в высотах
 * вьюпорта. Это окно (и его pacing, TITLE_EXIT_FRACTION/TITLE_EXIT_VH) —
 * ТОЛЬКО у Cliff-title, свой отдельный titleTrigger (см. ниже); картинки и
 * sub-title/description теперь на своём отдельном imagesTrigger со сдвигом
 * и большей длиной — см. IMAGES_START_OFFSET_VH/IMAGES_REVEAL_VH. */
const REVEAL_VH = 2
/** Насколько позже (в вьюпортах) относительно Cliff-title стартует
 * imagesTrigger — по просьбе пользователя: title должен начать уезжать
 * раньше, чем появляются и начинают двигаться картинки. titleTrigger
 * стартует как раньше (сразу после FADE_VH), imagesTrigger — на эту
 * дистанцию позже. */
const IMAGES_START_OFFSET_VH = 0.5
/** Дополнительный бюджет на движение картинок (и sub-title/description,
 * которые едут в этом же окне) поверх исходных REVEAL_VH — по просьбе
 * пользователя: "дай на движение изображений дополнительные 100vh". */
const IMAGES_EXTRA_VH = 1
/** Итоговая длина imagesTrigger. */
const IMAGES_REVEAL_VH = REVEAL_VH + IMAGES_EXTRA_VH
/** Доля imagesTrigger, за которую картинки долистывают opacity 0→1 — по
 * просьбе пользователя, в 2 раза быстрее, чем их же движение в стопку
 * (которое идёт на всю длину imagesTrigger, 0..1 от reveal напрямую). */
const IMAGES_OPACITY_FRACTION = 0.5

/** Окно fade-in title внутри FADE_VH (0..1). Картинки сюда больше не
 * входят — их opacity теперь меняется одновременно с их же движением в
 * стопку, внутри REVEAL_VH (см. imagesEase в trigger ниже), а не отдельной
 * более быстрой фазой перед ним. */
const TITLE_FADE_WINDOW: [number, number] = [0, 0.6]

/** Доля фазы REVEAL_VH, за которую Cliff-title успевает уйти за кадр
 * (см. покадровую сцену в Figma: -150 к кадру 4 из 5, т.е. к 75%). */
const TITLE_EXIT_FRACTION = 0.75
/** На сколько высот вьюпорта Cliff-title уезжает вверх — 623/1080 по
 * Figma-кадру (1920×1080), где 623 = 473 - (-150). */
const TITLE_EXIT_VH = (623 / 1080) * 100
/** Cliff-sub-title/description въезжают с боков во второй половине
 * REVEAL_VH (в кадрах 1-3 они ещё за кадром, см. Figma). */
const TEXT_ENTER_START = 0.5
/** На сколько ширин вьюпорта текстовые блоки въезжают с боков —
 * 660/1920 по Figma-кадру (Cliff-sub-title: x -640 → 20). */
const TEXT_ENTER_VW = (660 / 1920) * 100

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const windowProgress = (p: number, [start, end]: [number, number]) =>
  clamp((p - start) / (end - start))

export default function CliffSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subTitleRef = useRef<HTMLDivElement>(null)
  const descriptionWrapRef = useRef<HTMLDivElement>(null)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([])

  const setImgRef = (index: number) => (el: HTMLDivElement | null) => {
    imgRefs.current[index] = el
  }

  /* Скролл-переход Location1 → Cliff (см. покадровую сцену в Figma
   * «Location1 to Cliff» 1..5, затем «Cliff» 1..5). Cliff — `position:
   * sticky; top: 0` внутри обёртки Cliff-pin-wrap высотой
   * (1 + RISE_VH + FADE_VH + IMAGES_START_OFFSET_VH + IMAGES_REVEAL_VH)
   * вьюпортов (imagesTrigger заканчивается позже titleTrigger — именно она
   * теперь определяет общую длину, см. константы выше), сдвинутой на
   * `margin-top: -100vh` — тот же приём, что у Location1-pin-wrap (см.
   * Location1Section.tsx):
   * margin утягивает документный верх Cliff-wrap ровно на 1 вьюпорт
   * раньше, чем закончился бы Location1-wrap "по прямому потоку" — то
   * есть ровно туда, где начинается последний (замороженный) вьюпорт
   * Location1, и Cliff сама тут же встаёт на sticky. В тот же самый момент
   * Location1 (выше по z-index, см. Location1Section.tsx) отклеивается и
   * естественным document flow уезжает вверх — никакого JS на саму
   * позицию ни у той, ни у другой стороны, обе стороны просто следствие
   * структуры обёрток.
   *
   * `wrapTop()` — та же абсолютная doc-flow позиция wrap, что и в
   * Location1Section.tsx/IntroSection.tsx/PresenceSection.tsx.
   *
   * 1) riseTrigger (первые RISE_VH вьюпорта СОБСТВЕННОЙ sticky-фазы Cliff,
   *    т.е. ПОСЛЕ wrapTop, не до) — Cliff уже неподвижна, а Location1 в
   *    этом же окне физически уезжает вверх сама (см. константу RISE_VH
   *    выше). Чистая косметика синхронно с этим уже идущим отъездом:
   *    скругление нижних углов Location1 (зеркально тому, как
   *    распрямлялся верхний край в IntroSection.tsx, но снизу), дотягивает
   *    до 100% ровно к концу фазы, к моменту, когда Location1 уже
   *    полностью скрылась за верхним краем экрана. Содержимое самого
   *    Cliff здесь не трогается — см. fadeTrigger ниже.
   * 2) fadeTrigger (следующие FADE_VH вьюпорта, сразу после riseTrigger) —
   *    только теперь, когда Location1 гарантированно уже скрылась,
   *    начинает проявляться из прозрачности Cliff-title.
   * 3) titleTrigger (REVEAL_VH вьюпортов сразу следом) — Cliff-title
   *    уходит вверх и пропадает за кадром (та же пара TITLE_EXIT_FRACTION/
   *    TITLE_EXIT_VH, что и раньше).
   * 4) imagesTrigger — стартует на IMAGES_START_OFFSET_VH позже
   *    titleTrigger (title должен начать уезжать раньше, чем появляются и
   *    двигаются картинки, по просьбе пользователя) и длится
   *    IMAGES_REVEAL_VH (REVEAL_VH + доп. бюджет IMAGES_EXTRA_VH, тоже по
   *    просьбе): Cliff-sub-title/-description въезжают с боков (изначально
   *    за кадром слева/справа); 5 фото из Cliff-img-wrap сходятся в стопку
   *    точно в центре обёртки — в Figma центры всех 5 фото в кадре 5
   *    совпадают с центром Cliff-img-wrap с точностью до пикселя. Opacity
   *    у картинок — на своём отдельном imagesOpacityEase, вдвое быстрее
   *    движения (IMAGES_OPACITY_FRACTION), по просьбе пользователя. */
  useEffect(() => {
    const wrap = wrapRef.current
    const section = sectionRef.current
    // #location1 — сама запиненная (sticky) секция Location1 (см.
    // Location1Section.tsx); скругление нижних углов при наезде — на ней
    // самой (overflow-hidden, фон, контент).
    const location1 = document.getElementById('location1')
    const title = titleRef.current
    const subTitle = subTitleRef.current
    const descriptionWrap = descriptionWrapRef.current
    const images = imgRefs.current
    if (
      !wrap ||
      !section ||
      !location1 ||
      !title ||
      !subTitle ||
      !descriptionWrap
    ) {
      return
    }
    if (reduceMotion()) {
      title.style.opacity = '1'
      images.forEach((img) => {
        if (img) img.style.opacity = '1'
      })
      return
    }

    // Cliff-sub-title/-description изначально должны стоять за кадром
    // слева/справа (см. TEXT_ENTER_VW/trigger ниже) — но их transform
    // выставляет только `trigger`, стартующий лишь после RISE_VH+FADE_VH.
    // Без этой инициализации в промежутке riseTrigger/fadeTrigger (пока
    // Cliff только появляется) у них нет вообще никакого transform, и они
    // на мгновение видны в своей обычной (центр экрана) позиции.
    subTitle.style.transform = `translateX(${-TEXT_ENTER_VW}vw)`
    descriptionWrap.style.transform = `translateX(${TEXT_ENTER_VW}vw)`

    // Смещение центра каждого фото от центра Cliff-img-wrap — считаем
    // один раз по исходной (ещё не тронутой transform'ом) вёрстке, чтобы
    // на 100% прогресса каждое фото легло ровно в центр обёртки.
    const measure = () =>
      images.map((img) => {
        const wrapper = img?.parentElement
        // Реальное визуальное положение фото — на вложенном div'е (там
        // же живёт `-translate-y-1/2` и т.п. для его собственного
        // Tailwind-центрирования); сам `img` (ref) — только позиционер
        // без транформа, чтобы наш JS-transform ничего не перекрывал.
        const inner = img?.firstElementChild as HTMLElement | null
        if (!img || !wrapper || !inner) return { dx: 0, dy: 0 }
        const prevTransform = img.style.transform
        img.style.transform = 'none'
        const wrapRect = wrapper.getBoundingClientRect()
        const imgRect = inner.getBoundingClientRect()
        img.style.transform = prevTransform
        return {
          dx:
            wrapRect.left +
            wrapRect.width / 2 -
            (imgRect.left + imgRect.width / 2),
          dy:
            wrapRect.top +
            wrapRect.height / 2 -
            (imgRect.top + imgRect.height / 2),
        }
      })

    let offsets = measure()
    const onResize = () => {
      offsets = measure()
    }
    window.addEventListener('resize', onResize)

    const wrapTop = () => {
      const r = wrap.getBoundingClientRect()
      return r.top + window.scrollY
    }

    const riseTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: wrapTop,
      end: () => wrapTop() + window.innerHeight * RISE_VH,
      scrub: true,
      onUpdate: (self) => {
        const t = easeOutCubic(self.progress)
        const radius = t * 45
        location1.style.borderBottomLeftRadius = `${radius}vw`
        location1.style.borderBottomRightRadius = `${radius}vw`
      },
    })

    const fadeTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() + window.innerHeight * RISE_VH,
      end: () => wrapTop() + window.innerHeight * (RISE_VH + FADE_VH),
      scrub: true,
      onUpdate: (self) => {
        title.style.opacity = String(
          windowProgress(self.progress, TITLE_FADE_WINDOW),
        )
      },
    })

    const titleTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => wrapTop() + window.innerHeight * (RISE_VH + FADE_VH),
      end: () =>
        wrapTop() + window.innerHeight * (RISE_VH + FADE_VH + REVEAL_VH),
      scrub: true,
      onUpdate: (self) => {
        const titleEase = easeOutCubic(clamp(self.progress / TITLE_EXIT_FRACTION))
        title.style.transform = `translateY(${-titleEase * TITLE_EXIT_VH}vh)`
      },
    })

    const imagesTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () =>
        wrapTop() +
        window.innerHeight * (RISE_VH + FADE_VH + IMAGES_START_OFFSET_VH),
      end: () =>
        wrapTop() +
        window.innerHeight *
          (RISE_VH + FADE_VH + IMAGES_START_OFFSET_VH + IMAGES_REVEAL_VH),
      scrub: true,
      onUpdate: (self) => {
        const reveal = self.progress

        const textEase = easeOutCubic(
          clamp((reveal - TEXT_ENTER_START) / (1 - TEXT_ENTER_START)),
        )
        subTitle.style.transform = `translateX(${-(1 - textEase) * TEXT_ENTER_VW}vw)`
        descriptionWrap.style.transform = `translateX(${(1 - textEase) * TEXT_ENTER_VW}vw)`

        const imagesEase = easeOutCubic(reveal)
        const imagesOpacityEase = easeOutCubic(
          clamp(reveal / IMAGES_OPACITY_FRACTION),
        )
        images.forEach((img, i) => {
          if (!img) return
          const { dx, dy } = offsets[i]
          img.style.opacity = String(imagesOpacityEase)
          img.style.transform = `translate(${dx * imagesEase}px, ${dy * imagesEase}px)`
        })
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      riseTrigger.kill()
      fadeTrigger.kill()
      titleTrigger.kill()
      imagesTrigger.kill()
      location1.style.borderBottomLeftRadius = ''
      location1.style.borderBottomRightRadius = ''
      title.style.opacity = ''
      title.style.transform = ''
      subTitle.style.transform = ''
      descriptionWrap.style.transform = ''
      images.forEach((img) => {
        if (img) {
          img.style.opacity = ''
          img.style.transform = ''
        }
      })
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="Cliff-pin-wrap relative"
      style={{
        height: `${(1 + RISE_VH + FADE_VH + IMAGES_START_OFFSET_VH + IMAGES_REVEAL_VH) * 100}vh`,
        marginTop: '-100vh',
      }}
    >
      <section
        id="cliff"
        ref={sectionRef}
        className="Cliff sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-light px-2.5 py-30 lg:px-5"
      >
        <h2
          ref={titleRef}
          className="Cliff-title pointer-events-none absolute inset-0 z-1 flex items-center justify-center whitespace-nowrap font-manrope text-[1.875rem] font-semibold tracking-[-0.04em] text-dark opacity-0 md:text-[3.375rem] lg:text-[8.375rem] lg:tracking-[-0.06em]"
        >
          The Cliff Villa
        </h2>

        <div className="Cliff-content-wrap relative z-2 flex w-full flex-col items-center lg:flex-row lg:items-center lg:justify-center lg:gap-5">
          <div
            ref={subTitleRef}
            className="Cliff-sub-title w-full md:w-72.5 lg:w-[38.75rem]"
          >
            <p className="translate-y-[1.6406rem] text-center font-manrope text-[1.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-dark md:translate-y-[1.7598rem] lg:translate-y-0 lg:text-left lg:text-[2.875rem]">
              Not an Escape,
              <br />
              but a Return <br className="hidden lg:block" />
              to Clear Attention
            </p>
          </div>

          <div className="Cliff-img-wrap relative mt-[23rem] mb-[26rem] h-35.5 w-42.5 shrink-0 md:mt-[26rem] md:mb-[32rem] md:h-50 md:w-60 lg:m-0 lg:h-125 lg:w-150">
            <div
              ref={setImgRef(0)}
              className="Cliff-img-1 absolute left-[-8.0625rem] top-[calc(50%-21.78125rem)] opacity-0 md:left-[-17.625rem] md:top-[calc(50%-24.75rem)] lg:left-[-45.1875rem] lg:top-[calc(50%-20.625rem)]"
            >
              <div
                className={`-translate-y-1/2 h-[7.1875rem] w-[11.375rem] md:h-[11.875rem] md:w-[18.75rem] lg:h-[23.75rem] lg:w-[37.5rem] ${IMAGE_RADIUS}`}
              >
                <img
                  src={cliff1}
                  alt="Living room silhouette at sunset with ocean view"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div
              ref={setImgRef(1)}
              className="Cliff-img-2 absolute right-[-6.1875rem] top-[calc(50%-16.3125rem)] opacity-0 md:right-auto md:left-[calc(50%+18.9375rem)] md:top-[calc(50%-17.9375rem)] lg:left-[calc(50%+37.5rem)] lg:top-[calc(50%-30.625rem)]"
            >
              <div
                className={`-translate-y-1/2 h-[9.375rem] w-[7.5rem] md:-translate-x-1/2 md:h-[15.625rem] md:w-[12.5rem] lg:-translate-x-1/2 lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
              >
                <img
                  src={cliff2}
                  alt="Living room window framing ocean waves and cliffs"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div
              ref={setImgRef(2)}
              className="Cliff-img-3 absolute left-[-8.3125rem] top-[calc(50%+4.6875rem)] opacity-0 md:left-[-20.1875rem] md:top-[calc(50%+6.125rem)] lg:left-[-53.75rem] lg:top-[calc(50%+15rem)]"
            >
              <div
                className={`-translate-y-1/2 h-[8.25rem] w-[6.375rem] md:h-[13.75rem] md:w-[10.625rem] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
              >
                <img
                  src={cliff3}
                  alt="Terrace daybed overlooking the cliffside at dusk"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div
              ref={setImgRef(3)}
              className="Cliff-img-4 absolute left-[11.875rem] top-[calc(50%+10.78125rem)] opacity-0 md:left-[23.3125rem] md:top-[calc(50%+14.1875rem)] lg:left-[56.25rem] lg:top-[calc(50%+18.75rem)]"
            >
              <div
                className={`-translate-y-1/2 h-[8.0625rem] w-[6.25rem] md:h-[13.75rem] md:w-[10.625rem] lg:h-[27.5rem] lg:w-[21.25rem] ${IMAGE_RADIUS}`}
              >
                <img
                  src={cliff4}
                  alt="Ocean waves seen through the living room sliding doors"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div
              ref={setImgRef(4)}
              className="Cliff-img-5 absolute left-[calc(50%-3rem)] top-[calc(50%+23.9375rem)] opacity-0 md:left-[calc(50%-3.875rem)] md:top-[calc(50%+28.3125rem)] lg:left-[calc(50%-8.75rem)] lg:top-[calc(50%+30.625rem)]"
            >
              <div
                className={`-translate-x-1/2 -translate-y-1/2 h-[9.375rem] w-[7.5rem] md:h-[15.625rem] md:w-[12.5rem] lg:h-[31.25rem] lg:w-[25rem] ${IMAGE_RADIUS}`}
              >
                <img
                  src={cliff5}
                  alt="Aerial view of the villa and pool above the coastline at sunset"
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div
            ref={descriptionWrapRef}
            className="Cliff-description-wrap w-full lg:w-[38.75rem]"
          >
            <div className="flex -translate-y-[0.9814rem] md:-translate-y-[2.2373rem] lg:translate-y-0 lg:justify-end">
              <p className="Cliff-description w-full text-center font-manrope text-[0.875rem] leading-[1.3] font-medium tracking-[-0.01em] text-dark lg:w-[23.125rem] lg:text-left lg:text-[1.125rem]">
                This space is not about retreating from life, but about removing
                what distracts you from it. Here, attention becomes stable.
                Thoughts slow down.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
