/*
 * Site motion — fluid, persistent, GPU-friendly.
 *
 * Principles
 * - Bidirectional: every scroll-triggered reveal plays on enter AND reverses
 *   on leave, so the effect is persistent — scroll back up and it replays.
 * - Transform-only: clip-path replaced by an overlay <div> animating scaleY,
 *   which the browser composites on the GPU. No repaints per frame.
 * - Expo curves: more cinematic trail than power3, better "settle" feel.
 * - Lenis cinematic preset: lerp 0.08, duration 1.3, touch 1.5.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SESSION_KEY = 'homeOpeningSeen';

const TOGGLE_BIDIR: 'play reverse play reverse' = 'play reverse play reverse';

let lenis: Lenis | null = null;
let tickerHandler: ((time: number) => void) | null = null;
let resizeHandler: (() => void) | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

function isHomePage(): boolean {
  return document.querySelector('#hero') !== null;
}

function revealAll(): void {
  document.documentElement.classList.remove('js-opening-pending');
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

/* HOME OPENING — cinematic word reveal, plays once per session. */
function moveHomeOpening(): void {
  const seen = sessionStorage.getItem(SESSION_KEY) === '1';
  if (seen) {
    revealAll();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    tl.progress(1, false);
    revealAll();
    sessionStorage.setItem(SESSION_KEY, '1');
    skipEvents.forEach((evt) => window.removeEventListener(evt, skip, true));
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.to(
    '.hero-word',
    { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'expo.out' },
    0.25
  )
    .to('#hero-eyebrow', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.55)
    .to('#hero-lead', { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.9)
    .to('#hero-scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.2)
    .to('#hero-portrait', { opacity: 1, duration: 0.85, ease: 'power2.out' }, 1.35);

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

/* Helpers: if an element contains .word children (split-by-word title),
   target those for granular per-word animation; otherwise target the element. */
function expandTargets(items: Iterable<HTMLElement>): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const item of items) {
    const words = item.querySelectorAll<HTMLElement>('.word');
    if (words.length > 0) {
      for (const w of words) out.push(w);
    } else {
      out.push(item);
    }
  }
  return out;
}

/* INNER PAGE ENTRY — composes the first section's title block at init.
   Long delay so the animation starts AFTER the user perceives the page,
   not during paint. */
function movePageEntry(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-page-entry]');
  if (!items.length) return;
  const targets = expandTargets(items);

  // Force initial state synchronously — defensive against any CSS race.
  gsap.set(targets, { opacity: 0, y: 56 });

  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: 'expo.out',
    delay: 1.0,
    overwrite: 'auto',
    clearProps: 'will-change',
  });
}

/* SCROLL-REVEAL — bidirectional, expo.out, big enough to be felt. */
function moveScrollReveal(): void {
  document.querySelectorAll<HTMLElement>('section').forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;
    const targets = expandTargets(items);

    gsap.set(targets, { opacity: 0, y: 56 });

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      stagger: 0.09,
      ease: 'expo.out',
      overwrite: 'auto',
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        end: 'bottom 18%',
        toggleActions: TOGGLE_BIDIR,
      },
    });
  });
}

/* CURTAIN VEILS — overlay scaleY 1→0 from top, GPU-composited.
   Bidirectional: the veil falls back when the section leaves and rises
   again on return. Built on transform only, no clip-path. */
function moveCurtainVeils(): void {
  document
    .querySelectorAll<HTMLElement>('[data-curtain-veil]')
    .forEach((veil) => {
      const trigger = veil.closest('section') || veil.parentElement;
      if (!trigger) return;
      gsap.fromTo(
        veil,
        { scaleY: 1 },
        {
          scaleY: 0,
          duration: 1.3,
          ease: 'expo.inOut',
          transformOrigin: 'top center',
          overwrite: 'auto',
          scrollTrigger: {
            trigger,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: TOGGLE_BIDIR,
          },
        }
      );
    });
}

function init(): void {
  const w = window as unknown as { __motionSafety?: ReturnType<typeof setTimeout> };
  if (w.__motionSafety) {
    clearTimeout(w.__motionSafety);
    w.__motionSafety = undefined;
  }

  if (REDUCED) {
    // a11y first: everything visible, no transforms, no veils
    revealAll();
    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-page-entry]')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    document
      .querySelectorAll<HTMLElement>('[data-curtain-veil]')
      .forEach((el) => {
        el.style.transform = 'scaleY(0)';
      });
    return;
  }

  // Lenis — cinematic preset
  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    duration: 1.3,
    touchMultiplier: 1.5,
  });
  lenis.on('scroll', ScrollTrigger.update);

  tickerHandler = (time: number) => {
    if (lenis) lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerHandler);
  gsap.ticker.lagSmoothing(0);

  if (isHomePage()) {
    moveHomeOpening();
  } else {
    revealAll();
    movePageEntry();
  }

  moveScrollReveal();
  moveCurtainVeils();

  resizeHandler = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  };
  window.addEventListener('resize', resizeHandler);
}

document.addEventListener('astro:page-load', () => {
  cleanup();
  requestAnimationFrame(() => init());
});

document.addEventListener('astro:before-swap', () => cleanup());
