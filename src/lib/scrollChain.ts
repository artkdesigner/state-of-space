/**
 * Скролл-цепочка Hero → Intro → Location1 → Cliff.
 *
 * Hero и Intro держатся на `position: sticky` (см. HeroSection.tsx,
 * IntroSection.tsx) вместо GSAP `pin: true` — раньше обе секции пинились
 * через ScrollTrigger, а наезд следующей секции поверх текущей делался
 * вручную (отрицательный margin-top на следующей секции, ПЕРЕСЧИТЫВАЕМЫЙ
 * в JS на каждый тик скролла через onUpdate текущего пина). У этого было
 * два независимых источника багов: (1) `ScrollTrigger.refresh()`, нужный,
 * чтобы pin следующей секции не "телепортировался" при быстром скролле —
 * сам GSAP при пересчёте pin-спейсеров может подвинуть scroll(), чтобы
 * сохранить прогресс активного пина, и именно это при скролле
 * назад-и-снова-вперёд прямо на границе двух пинов давало наблюдаемый
 * скачок; (2) JS-margin-cancellation зависела от `ScrollTrigger.refresh()`,
 * вызванного ИМЕННО в нужный момент, иначе pin следующей секции не
 * совпадал с её реальной наездной позицией. `position: sticky` не
 * создаёт pin-спейсеров и ничего не пересчитывает — обёртка вокруг
 * секции физически резервирует нужную высоту в потоке документа.
 *
 * Наезд Intro поверх Hero — настоящий cover-переход (Hero остаётся
 * неподвижной под наезжающей Intro, а не едет одновременно с ней): у
 * Hero-wrap на 1 вьюпорт больше высоты, чем нужно самой Hero (держит её
 * приклеенной, пока Intro въезжает), а Intro-wrap подтянут вверх
 * СТАТИЧЕСКИМ (заданным один раз в CSS, не пересчитываемым в JS)
 * `margin-top: -100vh`, чтобы её физический наезд начинался ровно там,
 * где заканчивается собственная анимация Hero. Это НЕ та же ловушка, что
 * в п. (2) выше — margin здесь константа, не завязан на
 * `ScrollTrigger.refresh()` и ни на что не пересчитывается на скролле,
 * поэтому не может "устареть". Наезд Location1 поверх Intro пока остался
 * старым — последовательным (естественный запас высоты обёртки, без
 * margin-трюка), см. ниже.
 *
 * Location1 и Cliff пока остаются на старом GSAP `pin: true` + margin-
 * cancellation (наезд следующей секции) — эту часть цепочки пользователь
 * не помечал как сломанную, трогать не стали.
 */

/** Hero: рост + распрямление Hero-img, пока Hero-секция залипает вверху
 * (см. HeroSection.tsx). Hero-pin-wrap на 1 вьюпорт выше, чем "своя
 * высота (1) + пин (HERO_PIN_VH)" — этот лишний вьюпорт держит Hero
 * приклеенной, пока Intro (следующий сиблинг, но подтянутый вверх через
 * `margin-top: -100vh`, см. IntroSection.tsx) въезжает снизу вверх и
 * ПОЛНОСТЬЮ закрывает её — настоящий cover-переход, а не
 * последовательная прокрутка (когда обе секции едут одновременно и видны
 * разом, разрезанные пополам). */
export const HERO_PIN_VH = 3
/** Intro: побуквенный/поэлементный reveal, пока Intro-секция залипает
 * вверху (см. IntroSection.tsx). Наезд Location1 поверх Intro — уже
 * бесплатный последовательный (не cover), в последний 1 вьюпорт обёртки
 * Intro, а не часть INTRO_PIN_VH. */
export const INTRO_PIN_VH = 1
/** Location1: слайдер-кроссфейд (см. Location1Section.tsx). */
export const LOCATION1_PIN_VH = 3
/** Cliff: наезд Location1 + внутренняя хореография (см. CliffSection.tsx). */
export const CLIFF_PIN_VH = 4

/** Истинный конец обёртки Hero (= его собственная высота 1 vh + пин
 * HERO_PIN_VH + 1 лишний вьюпорт, который держит Hero приклеенной под
 * наезжающей Intro, см. HeroSection.tsx) — ровно там, где по document
 * flow физически заканчивается Hero-pin-wrap (Intro-wrap начинается
 * здесь, но сама Intro-СЕКЦИЯ визуально въезжает на 1 вьюпорт раньше —
 * см. `margin-top` на Intro-wrap). */
export const heroPinEnd = () => window.innerHeight * (2 + HERO_PIN_VH)
/** Истинный конец обёртки Intro (= его собственная высота 1 vh + пин) —
 * ровно там, где по document flow начинается Location1. Location1
 * по-прежнему пинится через GSAP на этой абсолютной позиции.
 * `+ INTRO_PIN_VH` без "+1": Intro-wrap физически занимает
 * (1 + INTRO_PIN_VH) вьюпортов, но `margin-top: -100vh` утягивает этот
 * вьюпорт обратно, поэтому вклад Intro в document flow — ровно
 * INTRO_PIN_VH, не (1 + INTRO_PIN_VH); итоговая абсолютная позиция
 * Location1 не изменилась по сравнению с версией без margin (1 лишний
 * вьюпорт у Hero компенсирует ровно 1 вьюпорт margin у Intro). */
export const introPinEnd = () =>
  heroPinEnd() + window.innerHeight * INTRO_PIN_VH
export const location1PinEnd = () =>
  introPinEnd() + window.innerHeight * LOCATION1_PIN_VH
export const cliffPinEnd = () =>
  location1PinEnd() + window.innerHeight * CLIFF_PIN_VH
