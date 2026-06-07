/*
 * Site motion — "stratigraphic unearthing"
 *
 * Signature gesture: each title word is excavated from earth — clip-path
 * rises from a ground line, the word starts blurred and slightly tracked
 * out, then sharpens and settles. A thin gold hairline draws at the
 * ground line; on page heros, the background image reveals with the same
 * clip-path wipe in sync.
 *
 * Variants
 * - PAGE HERO TITLE: full unearth (clip + blur + tracking + opacity)
 *   + ground line hairline + bg image clip-path wipe in sync.
 *   Plays at init, ~1.8 s total, ~0.3 s after paint. Sessions per page.
 * - SECTION TITLES on scroll: lighter unearth (no hairline, no bg sync).
 *   Bidirectional via toggleActions.
 * - NON-TITLE reveals: plain fade-up (existing behavior preserved).
 *
 * All guarded by prefers-reduced-motion.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SESSION_KEY_HOME = 'homeOpeningSeen';
const UNEARTH_SEEN_PREFIX = 'unearthSeen:';

const TOGGLE_BIDIR: 'play reverse play reverse' = 'play reverse play reverse';

// Final tracking the title settles into (matches CSS tracking-tight on display fonts)
const FINAL_TRACK = '-0.015em';

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

/* PAGE HERO UNEARTH — the signature gesture. */
function moveUnearthHero(): void {
  const heroTitle = document.querySelector<HTMLElement>('[data-unearth-hero]');
  if (!heroTitle) return;

  // Per-page sessionStorage flag so the gesture plays once per session per page.
  const key = UNEARTH_SEEN_PREFIX + location.pathname;
  if (sessionStorage.getItem(key) === '1') {
    // Skip — show everything in final state
    settleUnearth(heroTitle);
    return;
  }

  const wordsList = heroTitle.querySelectorAll<HTMLElement>('.word');
  const wordTargets: HTMLElement[] = wordsList.length > 0
    ? Array.from(wordsList)
    : [heroTitle];

  const groundLine = findGroundLine(heroTitle);
  const bgImage = document.querySelector<HTMLElement>('[data-unearth-bg]');

  // Defensive: lock initial state synchronously.
  gsap.set(wordTargets, {
    clipPath: 'inset(0 0 100% 0)',
    webkitClipPath: 'inset(0 0 100% 0)',
    filter: 'blur(8px)',
    letterSpacing: '0.06em',
    opacity: 0.4,
  });
  if (groundLine) {
    gsap.set(groundLine, {
      scaleX: 0,
      transformOrigin: groundLine.classList.contains('is-centered') ? 'center center' : 'left center',
      opacity: 0.9,
    });
  }
  if (bgImage) {
    gsap.set(bgImage, {
      clipPath: 'inset(0 0 100% 0)',
      webkitClipPath: 'inset(0 0 100% 0)',
    });
  }

  const tl = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      sessionStorage.setItem(key, '1');
      revealAll();
    },
  });

  // 1. Ground line draws (left edge of the excavation trench)
  if (groundLine) {
    tl.to(groundLine, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0);
  }

  // 2. Background image clip wipe — synced with the trench, slightly behind
  if (bgImage) {
    tl.to(
      bgImage,
      {
        clipPath: 'inset(0 0 0% 0)',
        webkitClipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        ease: 'power3.out',
      },
      0.15
    );
  }

  // 3. Words unearth — clip rises from ground, blur lifts, tracking settles,
  //    opacity comes home. The word emerges, dusts off, comes into focus.
  //    NOTE: no clearProps — leave the final inline values so the CSS
  //    pre-hide rule can't reassert and revert the words.
  tl.to(
    wordTargets,
    {
      clipPath: 'inset(0 0 0% 0)',
      webkitClipPath: 'inset(0 0 0% 0)',
      filter: 'blur(0px)',
      letterSpacing: FINAL_TRACK,
      opacity: 1,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
    },
    0.35
  );

  // 4. Ground line settles to its resting low-opacity state
  if (groundLine) {
    tl.to(groundLine, { opacity: 0.25, duration: 0.6, ease: 'power2.inOut' }, '>0.05');
  }

  // Allow user input to skip the sequence cleanly
  const skipEvents: Array<keyof WindowEventMap> = ['wheel', 'touchstart', 'keydown', 'click'];
  const skip = () => {
    if (tl.progress() >= 1) return;
    tl.progress(1, false);
  };
  skipEvents.forEach((evt) =>
    window.addEventListener(evt, skip, { capture: true, passive: true, once: true })
  );
}

function findGroundLine(heroTitle: HTMLElement): HTMLElement | null {
  let sib = heroTitle.nextElementSibling;
  while (sib) {
    if (sib instanceof HTMLElement && sib.matches('[data-ground-line]')) return sib;
    sib = sib.nextElementSibling;
  }
  // Fallback: look inside the parent container
  return heroTitle.parentElement?.querySelector<HTMLElement>('[data-ground-line]') ?? null;
}

function settleUnearth(heroTitle: HTMLElement): void {
  const words = heroTitle.querySelectorAll<HTMLElement>('.word');
  words.forEach((w) => {
    w.style.clipPath = 'inset(0 0 0% 0)';
    (w.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = 'inset(0 0 0% 0)';
    w.style.filter = 'blur(0px)';
    w.style.letterSpacing = FINAL_TRACK;
    w.style.opacity = '1';
  });
  const gl = findGroundLine(heroTitle);
  if (gl) {
    gl.style.transform = 'scaleX(1)';
    gl.style.opacity = '0.25';
  }
  const bg = document.querySelector<HTMLElement>('[data-unearth-bg]');
  if (bg) {
    bg.style.clipPath = 'inset(0 0 0% 0)';
    (bg.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = 'inset(0 0 0% 0)';
  }
}

/* HOME OPENING — combines unearth (h1 + bg) with cinematic fade of
   eyebrow / lead / scroll-hint / portrait. Plays once per session. */
function moveHomeOpening(): void {
  const seen = sessionStorage.getItem(SESSION_KEY_HOME) === '1';
  if (seen) {
    revealAll();
    settleUnearth(document.querySelector<HTMLElement>('[data-unearth-hero]')!);
    return;
  }

  // Pretend the unearth is part of the opening — moveUnearthHero will
  // run on its own and set the per-page session flag. We add only the
  // supporting fades here.
  const tl = gsap.timeline({
    delay: 0.55,
    onComplete: () => {
      sessionStorage.setItem(SESSION_KEY_HOME, '1');
      revealAll();
    },
  });

  tl.to('#hero-eyebrow', { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0)
    .to('#hero-lead', { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.35)
    .to('#hero-scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.7)
    .to('#hero-portrait', { opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.85);
}

/* PAGE ENTRY — non-unearth elements ([data-page-entry] without .word).
   Plain fade-up for eyebrows, body p, chapter marks, etc. */
function movePageEntry(): void {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>('[data-page-entry]:not([data-unearth-hero])')
  ).filter((el) => el.querySelectorAll('.word').length === 0);

  if (!items.length) return;

  gsap.set(items, { opacity: 0, y: 56 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: 'expo.out',
    delay: 0.85,
    overwrite: 'auto',
  });
}

/* SCROLL-REVEAL — bidirectional. Words get a lighter unearth (no hairline).
   Non-word items keep the existing fade-up. */
function moveScrollReveal(): void {
  document.querySelectorAll<HTMLElement>('section').forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;

    const wordTargets: HTMLElement[] = [];
    const plainItems: HTMLElement[] = [];
    items.forEach((it) => {
      const ws = it.querySelectorAll<HTMLElement>('.word');
      if (ws.length > 0) {
        ws.forEach((w) => wordTargets.push(w));
      } else {
        plainItems.push(it);
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        end: 'bottom 18%',
        toggleActions: TOGGLE_BIDIR,
      },
    });

    if (wordTargets.length > 0) {
      gsap.set(wordTargets, {
        clipPath: 'inset(0 0 100% 0)',
        webkitClipPath: 'inset(0 0 100% 0)',
        filter: 'blur(6px)',
        letterSpacing: '0.04em',
        opacity: 0.5,
      });
      tl.to(
        wordTargets,
        {
          clipPath: 'inset(0 0 0% 0)',
          webkitClipPath: 'inset(0 0 0% 0)',
          filter: 'blur(0px)',
          letterSpacing: FINAL_TRACK,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
        },
        0
      );
    }

    if (plainItems.length > 0) {
      gsap.set(plainItems, { opacity: 0, y: 56 });
      tl.to(
        plainItems,
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.08,
          ease: 'expo.out',
        },
        wordTargets.length > 0 ? 0.15 : 0
      );
    }
  });
}

/* CURTAIN VEILS — kept for section bg images that aren't part of the page
   hero unearth (lavoro paper on home, archè bridge on home). Bidirectional. */
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
    revealAll();
    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-page-entry]')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    document
      .querySelectorAll<HTMLElement>('.word')
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.clipPath = 'none';
        el.style.filter = 'none';
        el.style.letterSpacing = '';
        el.style.transform = 'none';
      });
    document
      .querySelectorAll<HTMLElement>('[data-curtain-veil]')
      .forEach((el) => {
        el.style.transform = 'scaleY(0)';
      });
    document
      .querySelectorAll<HTMLElement>('[data-unearth-bg]')
      .forEach((el) => {
        el.style.clipPath = 'none';
      });
    document
      .querySelectorAll<HTMLElement>('[data-ground-line]')
      .forEach((el) => {
        el.style.transform = 'scaleX(1)';
        el.style.opacity = '0.25';
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
    moveUnearthHero();
  } else {
    revealAll();
    moveUnearthHero();
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
