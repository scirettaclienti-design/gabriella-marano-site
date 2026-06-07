/*
 * Site motion — three intentional moves, applied site-wide.
 *
 * 1. PAGE ENTRY
 *    - On the home: the existing cinematic opening (h1 words + portrait).
 *    - On other pages: a calm composition of the first section's title block
 *      ([data-page-entry]) so the visitor "feels" landing.
 *    - In both cases, eager background images marked [data-curtain]
 *      [data-curtain-immediate] reveal with a clip-path curtain wipe
 *      top-to-bottom — the "unearthing" gesture for the archaeological brand.
 *
 * 2. SCROLL-REVEAL on [data-reveal] children of each section — y 32, dur 0.95,
 *    stagger 0.12, ease power3.out. Felt, not chaotic.
 *
 * 3. SCROLL-CURTAIN on [data-curtain] images that are NOT immediate — same
 *    clip-path wipe, triggered when the image enters the viewport.
 *
 * All guarded by prefers-reduced-motion.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SESSION_KEY = 'homeOpeningSeen';

const CURTAIN_FROM = 'inset(0 0 100% 0)';
const CURTAIN_TO = 'inset(0 0 0% 0)';

let lenis: Lenis | null = null;
let tickerHandler: ((time: number) => void) | null = null;
let resizeHandler: (() => void) | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

function isHomePage(): boolean {
  return document.querySelector('#hero') !== null;
}

function revealHero(): void {
  document.documentElement.classList.remove('js-opening-pending');
}

function clearWillChange(): void {
  document
    .querySelectorAll<HTMLElement>(
      '.hero-word, .hero-bg-image, #hero-portrait, #hero-eyebrow, #hero-lead, #hero-scroll-hint'
    )
    .forEach((el) => {
      el.style.willChange = 'auto';
    });
}

function cleanup(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (tickerHandler) {
    gsap.ticker.remove(tickerHandler);
    tickerHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

/* HOME — Cinematic opening reveal: bg image curtain + words + portrait last. */
function moveOpeningReveal(): void {
  const seen = sessionStorage.getItem(SESSION_KEY) === '1';
  if (seen) {
    revealHero();
    // Still play the curtain on the hero bg on return (light cue)
    gsap.fromTo(
      '.hero-bg-image[data-curtain]',
      { clipPath: CURTAIN_FROM },
      { clipPath: CURTAIN_TO, duration: 1.1, ease: 'power2.inOut' }
    );
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    tl.progress(1, false);
    revealHero();
    clearWillChange();
    sessionStorage.setItem(SESSION_KEY, '1');
    skipEvents.forEach((evt) => window.removeEventListener(evt, skip, true));
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.fromTo(
    '.hero-bg-image[data-curtain]',
    { clipPath: CURTAIN_FROM },
    { clipPath: CURTAIN_TO, duration: 1.4, ease: 'power2.inOut' },
    0
  )
    .to(
      '.hero-word',
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      },
      0.15
    )
    .to(
      '#hero-eyebrow',
      { opacity: 1, duration: 0.55, ease: 'power2.out' },
      0.55
    )
    .to(
      '#hero-lead',
      { opacity: 1, duration: 0.55, ease: 'power2.out' },
      0.95
    )
    .to(
      '#hero-scroll-hint',
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      1.25
    )
    .to(
      '#hero-portrait',
      { opacity: 1, duration: 0.85, ease: 'power2.out' },
      1.45
    );

  const skip = () => finish();
  const skipEvents: Array<keyof WindowEventMap> = [
    'wheel',
    'touchstart',
    'keydown',
    'click',
  ];
  skipEvents.forEach((evt) =>
    window.addEventListener(evt, skip, { capture: true, passive: true })
  );
}

/* INNER PAGES — Calm page entry: title composes + immediate curtain wipe. */
function movePageEntry(): void {
  const titleItems = Array.from(
    document.querySelectorAll<HTMLElement>('[data-page-entry]')
  );
  const immediateCurtain = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-curtain][data-curtain-immediate]'
    )
  );

  if (!titleItems.length && !immediateCurtain.length) return;

  const tl = gsap.timeline();

  if (immediateCurtain.length) {
    tl.fromTo(
      immediateCurtain,
      { clipPath: CURTAIN_FROM },
      { clipPath: CURTAIN_TO, duration: 1.2, ease: 'power2.inOut' },
      0
    );
  }

  if (titleItems.length) {
    tl.fromTo(
      titleItems,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        stagger: 0.14,
        ease: 'power3.out',
      },
      0.25
    );
  }
}

/* Scroll-reveal on [data-reveal] children, per section. */
function moveScrollReveal(): void {
  document.querySelectorAll<HTMLElement>('section').forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

/* Scroll-curtain on [data-curtain] images that are NOT immediate. */
function moveScrollCurtain(): void {
  const images = document.querySelectorAll<HTMLElement>(
    '[data-curtain]:not([data-curtain-immediate])'
  );
  images.forEach((img) => {
    gsap.fromTo(
      img,
      { clipPath: CURTAIN_FROM },
      {
        clipPath: CURTAIN_TO,
        duration: 1.0,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: img,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

function init(): void {
  // Clear the Base.astro safety-net timeout so .js-motion stays as long as we need.
  const safety = (window as unknown as { __motionSafety?: ReturnType<typeof setTimeout> })
    .__motionSafety;
  if (safety) {
    clearTimeout(safety);
    (window as unknown as { __motionSafety?: undefined }).__motionSafety = undefined;
  }

  if (REDUCED) {
    // a11y first: render everything visible, no transforms, no clip
    revealHero();
    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-page-entry]')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    document
      .querySelectorAll<HTMLElement>('[data-curtain]')
      .forEach((el) => {
        el.style.clipPath = 'none';
      });
    return;
  }

  // Smooth scroll on every page
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    duration: 1.1,
  });
  lenis.on('scroll', ScrollTrigger.update);

  tickerHandler = (time: number) => {
    if (lenis) lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerHandler);
  gsap.ticker.lagSmoothing(0);

  if (isHomePage()) {
    moveOpeningReveal();
  } else {
    revealHero();
    movePageEntry();
  }

  moveScrollReveal();
  moveScrollCurtain();

  resizeHandler = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  window.addEventListener('resize', resizeHandler);
}

/* Lifecycle: Astro view-transitions */
document.addEventListener('astro:page-load', () => {
  cleanup();
  requestAnimationFrame(() => init());
});

document.addEventListener('astro:before-swap', () => {
  cleanup();
});
