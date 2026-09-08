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
 * Наезд Intro поверх Hero и наезд Location1 поверх Intro — оба настоящие
 * cover-переходы (выходящая секция остаётся неподвижной под наезжающей
 * входящей, а не едет одновременно с ней): у выходящей секции wrap на
 * 1 вьюпорт больше высоты, чем нужно ей самой (держит её приклеенной,
 * пока входящая въезжает), а входящая (Intro-wrap / сам Location1)
 * подтянута вверх СТАТИЧЕСКИМ (заданным один раз в CSS, не
 * пересчитываемым в JS) `margin-top: -100vh`, чтобы её физический наезд
 * начинался ровно там, где заканчивается собственная анимация выходящей.
 * Это НЕ та же ловушка, что в п. (2) выше — margin здесь константа, не
 * завязан на `ScrollTrigger.refresh()` и ни на что не пересчитывается на
 * скролле, поэтому не может "устареть". Наезд Cliff поверх Location1
 * пока остался старым — margin-cancellation в onUpdate GSAP-пина
 * Location1 (см. Location1Section.tsx) — эту часть цепочки пользователь
 * не помечал как сломанную, трогать не стали.
 *
 * Location1 и Cliff пока остаются на старом GSAP `pin: true` (не
 * `position: sticky`) — но margin-приём для ВХОДА в Location1 (снизу, со
 * стороны Intro) работает и с GSAP pin:true: `start` пина — явная
 * абсолютная формула (не `'top top'`), а "въезд снизу" ДО того, как пин
 * включился — это просто обычное document-flow позиционирование самого
 * `<section>`, на которое статический `margin-top` действует точно так
 * же, как на любой другой блочный элемент.
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
 * вверху (см. IntroSection.tsx). Intro-wrap, как и Hero-wrap, на
 * 1 вьюпорт выше, чем "своя высота (1) + пин (INTRO_PIN_VH)" — держит
 * Intro приклеенной (уже полностью раскрытой), пока Location1 (тоже
 * подтянутый вверх своим `margin-top: -100vh`, см. Location1Section.tsx)
 * въезжает снизу и закрывает её — тот же cover-переход, что у Hero. */
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
/** Истинный конец обёртки Intro (= его собственная высота 1 vh + пин
 * INTRO_PIN_VH + 1 лишний вьюпорт, тот же приём, что у heroPinEnd) —
 * ровно там, где по document flow физически заканчивается Intro-wrap
 * (Location1 начинается здесь "по умолчанию", но сама секция визуально
 * въезжает на 1 вьюпорт раньше — см. `margin-top` на Location1). */
export const introPinEnd = () =>
  heroPinEnd() + window.innerHeight * (1 + INTRO_PIN_VH)
/** Момент, когда Location1 полностью въехала и закрыла Intro — это и
 * абсолютный `start` её GSAP-пина, и цель для её собственного
 * `margin-top: -100vh` (см. Location1Section.tsx): `introPinEnd() -
 * 1 вьюпорт`, т.е. ровно там, где заканчивается собственная PIN_VH-
 * анимация Intro (Intro при этом остаётся приклеенной ещё этот
 * последний вьюпорт intro-wrap, пока Location1 её закрывает). */
export const location1PinStart = () =>
  heroPinEnd() + window.innerHeight * INTRO_PIN_VH
export const location1PinEnd = () =>
  location1PinStart() + window.innerHeight * LOCATION1_PIN_VH
export const cliffPinEnd = () =>
  location1PinEnd() + window.innerHeight * CLIFF_PIN_VH
