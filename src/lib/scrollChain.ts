/**
 * Скролл-цепочка Hero → Intro → Location1 → Cliff держится на наезде
 * каждой следующей секции (margin-top, подготовленный ЗАРАНЕЕ предыдущим
 * шагом — см. комментарии в HeroSection/IntroSection/Location1Section).
 * Раньше pin каждого следующего шага стартовал на `start: 'top top'`,
 * полагаясь на то, что GSAP правильно закэширует натуральную позицию
 * элемента с учётом этого margin (после `ScrollTrigger.refresh()` в
 * onLeave предыдущего шага). При быстром скролле (флик) refresh иногда не
 * успевает сработать до того, как скролл уже проехал границу — pin либо
 * не включается вовсе, либо GSAP обнуляет margin при попытке его
 * запинить и не восстанавливает, и секция "телепортируется" на нужную
 * позицию вместо плавного пина.
 *
 * Чтобы полностью убрать зависимость от этого кэша, каждый pin в цепочке
 * стартует на точной, заранее вычисляемой абсолютной позиции скролла —
 * сумме высот вьюпорта всех предыдущих пинов. Это не зависит ни от
 * скорости скролла, ни от текущего состояния margin.
 */

/** Hero: рост + распрямление Hero-img (см. HeroSection.tsx). */
export const HERO_PIN_VH = 3
/** Intro: наезд Location1 (см. IntroSection.tsx). */
export const INTRO_PIN_VH = 2
/** Location1: слайдер-кроссфейд (см. Location1Section.tsx). */
export const LOCATION1_PIN_VH = 3
/** Cliff: наезд Location1 + внутренняя хореография (см. CliffSection.tsx). */
export const CLIFF_PIN_VH = 4

export const heroPinEnd = () => window.innerHeight * HERO_PIN_VH
export const introPinEnd = () =>
  heroPinEnd() + window.innerHeight * INTRO_PIN_VH
export const location1PinEnd = () =>
  introPinEnd() + window.innerHeight * LOCATION1_PIN_VH
export const cliffPinEnd = () =>
  location1PinEnd() + window.innerHeight * CLIFF_PIN_VH
