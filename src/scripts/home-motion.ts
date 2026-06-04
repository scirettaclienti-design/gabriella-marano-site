/*
 * Home cinematic motion — the 7 moves.
 * Lazy-loaded, mounts after first paint, fully guarded by prefers-reduced-motion.
 * Re-init on Astro view-transition page swaps.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SESSION_KEY = 'homeOpeningSeen';

const LENIS_LERP_NORMAL = 0.1;
const LENIS_LERP_HEAVY = 0.05;

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
  document.querySelectorAll<HTMLElement>(
    '.hero-word, #hero-portrait, #hero-eyebrow, #hero-lead, #hero-scroll-hint'
  ).forEach((el) => {
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

/* MOVE 1 — Opening reveal: solemn, skippable, once per session. */
function moveOpeningReveal(): void {
  const seen = sessionStorage.getItem(SESSION_KEY) === '1';
  if (seen) {
    revealHero();
    return;
  }

  if (lenis) lenis.stop();
  document.body.style.overflow = 'hidden';

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    tl.progress(1, false);
    revealHero();
    clearWillChange();
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    sessionStorage.setItem(SESSION_KEY, '1');
    skipEvents.forEach((evt) => window.removeEventListener(evt, skip, true));
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.to('.hero-word', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.18,
    ease: 'power3.out',
  })
    .to(
      '#hero-portrait',
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
      '-=0.4'
    )
    .to(
      '#hero-eyebrow',
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=1.0'
    )
    .to(
      '#hero-lead',
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .to(
      '#hero-scroll-hint',
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
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

/* MOVE 2 — Scroll-narrative stagger. */
function moveScrollStagger(): void {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>('[data-stagger-item]');
    if (!items.length) return;
    gsap.from(items, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* MOVE 3 — Living portrait: parallax + warm filter shift. */
function movePortraitParallax(): void {
  const portrait = document.querySelector<HTMLElement>('#hero-portrait');
  const hero = document.querySelector<HTMLElement>('#hero');
  if (!portrait || !hero) return;

  gsap.to(portrait, {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.fromTo(
    portrait,
    { filter: 'brightness(1) sepia(0)' },
    {
      filter: 'brightness(0.92) sepia(0.06)',
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
}

/* MOVE 5 — Roman numeral anchors (pin on desktop only). */
function moveNumeralPins(): void {
  if (window.matchMedia('(max-width: 767px)').matches) return;

  document.querySelectorAll<HTMLElement>('.lavoro-doors .door').forEach((door) => {
    const numeral = door.querySelector<HTMLElement>('[data-numeral]');
    if (!numeral) return;
    ScrollTrigger.create({
      trigger: numeral,
      start: 'top top+=80',
      endTrigger: door,
      end: 'bottom top+=200',
      pin: numeral,
      pinSpacing: false,
    });
  });
}

/* MOVE 7 — Archè threshold: heavier scroll feel + deeper bg + glow up. */
function moveArcheThreshold(): void {
  const arche = document.querySelector<HTMLElement>('#arche-bridge');
  if (!arche) return;

  ScrollTrigger.create({
    trigger: arche,
    start: 'top 70%',
    end: 'bottom 30%',
    onEnter: () => {
      if (lenis) lenis.options.lerp = LENIS_LERP_HEAVY;
      arche.classList.add('threshold-active');
    },
    onLeave: () => {
      if (lenis) lenis.options.lerp = LENIS_LERP_NORMAL;
      arche.classList.remove('threshold-active');
    },
    onEnterBack: () => {
      if (lenis) lenis.options.lerp = LENIS_LERP_HEAVY;
      arche.classList.add('threshold-active');
    },
    onLeaveBack: () => {
      if (lenis) lenis.options.lerp = LENIS_LERP_NORMAL;
      arche.classList.remove('threshold-active');
    },
  });
}

function init(): void {
  if (!isHomePage()) {
    revealHero();
    return;
  }

  if (REDUCED) {
    // a11y first: render fully visible, no transforms, no scroll-lock
    revealHero();
    return;
  }

  // Lenis smooth scroll + GSAP ticker bridge
  lenis = new Lenis({
    lerp: LENIS_LERP_NORMAL,
    smoothWheel: true,
    duration: 1.1,
  });
  lenis.on('scroll', ScrollTrigger.update);

  tickerHandler = (time: number) => {
    if (lenis) lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerHandler);
  gsap.ticker.lagSmoothing(0);

  // Moves 1, 2, 3, 5, 7 (Moves 4 and 6 are CSS-only / Astro built-in)
  moveOpeningReveal();
  moveScrollStagger();
  movePortraitParallax();
  moveNumeralPins();
  moveArcheThreshold();

  // Debounced resize refresh
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
