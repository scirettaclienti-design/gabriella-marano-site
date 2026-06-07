# Motion diagnosis — 2026-06-07

Diagnosis run after the user reported "no visible animation on load
or scroll" across /metodo /perizie /arche.

## Setup
- Headless Chromium via Playwright at 1440×900.
- Dev server (`pnpm dev`, port 4321) serving the latest commits.
- Probed pages: /metodo and /arche (representative of inner pages).

## Findings — what works

| Check | Result |
|---|---|
| `matchMedia('(prefers-reduced-motion: reduce)').matches` | `false` |
| Motion script (`home-motion.ts`) loaded on inner pages | yes — also gsap, gsap/ScrollTrigger, lenis |
| `init()` runs on non-home pages (no longer gated by `isHomePage`) | yes |
| ScrollTrigger instances created per section with `[data-reveal]` | yes — 2 on /metodo, 3 on /arche |
| Elements above the fold reach `opacity: 1, transform: none` | yes, within ~1 s of load |
| Elements below the fold pre-staged at `opacity: 0, translateY(20)` | yes — set inline by GSAP `fromTo` with immediateRender |
| When a below-fold section enters the viewport, `fromTo` plays | yes |

## Findings — what fails the user

| Issue | Why |
|---|---|
| No perceived "entrance" on /storia /metodo /perizie /arche | Only the home has the hero opening reveal. Other pages rely on the same scroll-reveal hooks, which complete in ~1 s at the very top — invisible for someone who lands on the page. |
| Below-fold reveals feel "non-event" | `y: 20`, `duration: 0.75`, `stagger: 0.08`, `ease: power2.out` → total run ≈ 1 s with a 20 px travel. Too short and too small a delta to register as editorial motion on desktop. |
| No image-entry animation | Pictures appear plainly at first paint or first scroll. No curtain, no wipe, no settle. |

## Side observation

The body-tail safety net script removes `js-motion` from `<html>`
after 5 s. The class is no longer required for `[data-reveal]` because
GSAP `fromTo` sets the inline `opacity: 0; transform: translateY(20)`
state directly (immediateRender). The class still matters for
`.js-opening-pending` flow on the home hero. Net: harmless, but worth
documenting.

## Conclusion

The motion runtime is not dead. It is **sub-perception**: working but
invisible. Step 2 raises the floor: page-entry on every page, beefier
section reveals, and a clip-path curtain wipe on images — the
"unearthing" gesture that pairs with the archaeological theme.
