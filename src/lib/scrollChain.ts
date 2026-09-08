/**
 * Скролл-цепочка Hero → Intro → Location1 → Cliff.
 *
 * Hero и Intro держатся на `position: sticky` (см. HeroSection.tsx,
 * IntroSection.tsx) вместо GSAP `pin: true` — раньше обе секции пинились
 * через ScrollTrigger, а наезд следующей секции поверх текущей делался
 * вручную (отрицательный margin-top на следующей секции, гасился в
 * onUpdate текущего пина). У этого было два независимых источника багов:
 * (1) `ScrollTrigger.refresh()`, нужный, чтобы pin следующей секции не
 * "телепортировался" при быстром скролле — сам GSAP при пересчёте
 * pin-спейсеров может подвинуть scroll(), чтобы сохранить прогресс
 * активного пина, и именно это при скролле назад-и-снова-вперёд прямо на
 * границе двух пинов давало наблюдаемый скачок; (2) margin-cancellation
 * зависела от `ScrollTrigger.refresh()`, вызванного ИМЕННО в нужный
 * момент, иначе pin следующей секции не совпадал с её реальной наездной
 * позицией. `position: sticky` не создаёт pin-спейсеров и ничего не
 * пересчитывает — обёртка вокруг секции физически резервирует нужную
 * высоту в потоке документа, и наезд следующей секции происходит
 * естественно (см. подробности в HeroSection.tsx/IntroSection.tsx).
 *
 * Location1 и Cliff пока остаются на старом GSAP `pin: true` + margin-
 * cancellation (наезд следующей секции) — эту часть цепочки пользователь
 * не помечал как сломанную, трогать не стали.
 */

/** Hero: рост + распрямление Hero-img, пока Hero-секция залипает вверху
 * (см. HeroSection.tsx). Наезд Intro поверх Hero происходит бесплатно, в
 * последний 1 вьюпорт обёртки Hero (после того как Hero отлипает) — это
 * НЕ часть HERO_PIN_VH, а естественный запас высоты обёртки. */
export const HERO_PIN_VH = 3
/** Intro: побуквенный/поэлементный reveal, пока Intro-секция залипает
 * вверху (см. IntroSection.tsx). Наезд Location1 поверх Intro — тоже
 * бесплатный, в последний 1 вьюпорт обёртки Intro, а не часть
 * INTRO_PIN_VH (раньше сюда же включалась отдельная "rise"-фаза с ручным
 * naездом — при sticky она не нужна). */
export const INTRO_PIN_VH = 1
/** Location1: слайдер-кроссфейд (см. Location1Section.tsx). */
export const LOCATION1_PIN_VH = 3
/** Cliff: наезд Location1 + внутренняя хореография (см. CliffSection.tsx). */
export const CLIFF_PIN_VH = 4

/** Истинный конец обёртки Hero (= его собственная высота 1 vh + пин) —
 * ровно там, где по document flow начинается Intro. */
export const heroPinEnd = () => window.innerHeight * (1 + HERO_PIN_VH)
/** Истинный конец обёртки Intro (= его собственная высота 1 vh + пин) —
 * ровно там, где по document flow начинается Location1. Location1
 * по-прежнему пинится через GSAP на этой абсолютной позиции. */
export const introPinEnd = () =>
  heroPinEnd() + window.innerHeight * (1 + INTRO_PIN_VH)
export const location1PinEnd = () =>
  introPinEnd() + window.innerHeight * LOCATION1_PIN_VH
export const cliffPinEnd = () =>
  location1PinEnd() + window.innerHeight * CLIFF_PIN_VH
