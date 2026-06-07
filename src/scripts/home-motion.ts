/*
 * Home motion — three intentional moves.
 *
 * 1. Opening reveal: hero h1 words fade up + bg image slow scale 1.08→1.
 *    Portrait fades in last. No scroll-lock. Once per session.
 * 2. Section-title scroll-reveal: eyebrow + h2 of each non-hero section
 *    fade up once when entering viewport. Bodies and CTAs just appear.
 * 3. Three doors hover: CSS-only (see index.astro <style> block).
 *
 * All guarded by prefers-reduced-motion.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SESSION_KEY = 'homeOpeningSeen';

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

/* MOVE 1 — Opening reveal: h1 words + portrait + slow bg scale. */
function moveOpeningReveal(): void {
  const seen = sessionStorage.getItem(SESSION_KEY) === '1';
  if (seen) {
    revealHero();
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

  // Slow bg "settle" runs the whole length of the reveal.
  tl.to(
    '.hero-bg-image',
    { scale: 1, duration: 2.0, ease: 'power2.out' },
    0
  )
    // Words fade up softly — calmer than before
    .to(
      '.hero-word',
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      },
      0
    )
    .to(
      '#hero-eyebrow',
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.5
    )
    .to(
      '#hero-lead',
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.85
    )
    .to(
      '#hero-scroll-hint',
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      1.15
    )
    // Portrait last
    .to(
      '#hero-portrait',
      { opacity: 1, duration: 0.85, ease: 'power2.out' },
      1.35
    );

  // Skippable on any user input. No scroll-lock.
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

/* MOVE 2 — Scroll-reveal: each section reveals its [data-reveal] children in a
   calm upward drift + fade, staggered. Runs on every page that has the markers.
   Uses fromTo with explicit end state because the CSS pre-hide sets the natural
   computed state to opacity 0 — a plain gsap.from() would animate "0 → 0". */
function moveScrollReveal(): void {
  document.querySelectorAll<HTMLElement>('section').forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
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

function init(): void {
  if (REDUCED) {
    // a11y first: render everything visible, no transforms
    revealHero();
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
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

  // Hero opening reveal only on the home (uses #hero-* nodes)
  if (isHomePage()) {
    moveOpeningReveal();
  } else {
    revealHero();
  }

  moveScrollReveal();

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
