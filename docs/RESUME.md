# Gabriella Marano — Riepilogo sessione e punto di ripartenza

> File-bussola per riaprire il lavoro al volo in una nuova sessione di Claude
> Code. Lo legge la prossima istanza dell'assistente; lo legge anche Ivano
> per capire al colpo d'occhio dove siamo.

---

## TL;DR (1 riga)

Sito istituzionale Gabriella Marano (Astro 5 + design system archè) **completo
in struttura**, **branch `feature/home-cinematic` pushato su origin**, **18
pagine + 6 asset tutti 200**, **build 1.27 s**, **3 entries Media + 2 PDF
ancora placeholder**. In attesa che Gabriella veda e dia feedback.

---

## Cosa è il progetto

Sito ufficiale di **Gabriella Marano** — psicologa clinica e forense,
criminologa, archeologa. Pubblico primario: magistrati, avvocati, giornalisti,
editori, organizzatori di formazione. Pubblico secondario: chi arriva dal
ponte editoriale di **archè** (archecrime.com).

Tono di voce: registro archè meno il 30 % di drama → sobrio, autorevole,
asciutto. L'archeologia è la chiave di lettura: rovine → frammenti → metodo
(non un dettaglio biografico).

Vedi anche:
- `CLAUDE.md` (project root) — disciplina copy + visiva + performance target
- `docs/copy-brief.md` — brief originale ricevuto da Gabriella
- `docs/regia.html` — documento di regia archè (verità ultima)
- `.claude/skills/arche-brand/SKILL.md` — skill di brand archè

---

## Stack tecnico

- **Astro 5.18.2** + TypeScript strict + Tailwind 3.4 + MDX + Sitemap
- **Design system:** `@scirettaclienti-design/arche-design-system@0.1.0`
  (privato, GitHub Packages, scope-mapped via `.npmrc` di repo)
- **Motion:** GSAP 3.15 + ScrollTrigger + Lenis 1.3 (solo home opening)
- **Content Collections** (Zod): televisione / scrittura / formazione / incontri
- **View Transitions** Astro con name-match morphs (`vt-arche-heading`,
  `vt-storia-heading`)
- **Deploy target:** Vercel (non ancora collegato)
- **Repo:** https://github.com/scirettaclienti-design/gabriella-marano-site
- **Branch attivo:** `feature/home-cinematic` (16 commit avanti su `main`)

---

## Cosa è già fatto e in repo (committato + pushato)

### Pagine (18 generate al build)

| Route | Stato |
|---|---|
| `/` | ✅ Home cinematografica — hero unearth (marble + portrait + h1 word-split), storia anticipo, lavoro (3 doors), media outlets, pull-quote intermezzo, affiliazioni, archè bridge |
| `/storia` | ✅ Bio 2 colonne, Picture B/N reale, download CV + press kit |
| `/metodo` | ✅ Tre principi + concretezza |
| `/perizie` | ✅ **Pagina light** (#F2EAD3 bg, ink text) per magistrati/avvocati — numeral stacked sopra h3, no overflow |
| `/arche` | ✅ Ponte verso archecrime.com |
| `/media` | ✅ Hub con 4 type cards |
| `/media/televisione \| scrittura \| formazione \| incontri` | ✅ 4 type index, content collections + cover slot |
| `/media/{type}/{slug}` × 5 | ✅ Dynamic detail page (breadcrumb + unearth h2 + MDX content + related) |
| `/contatti` | ✅ 3 canali (Stampa/Incarichi/Formazione) + **Davide Tosi referente management** + emergency 24h |
| `/privacy`, `/cookie` | ✅ Stub legali |

### Asset pubblici

- `public/favicon.svg` — ✦ archè star gold on ink
- `public/og.jpg` — ritratto editoriale (~80 KB)
- `public/robots.txt` — allows /, disallows /privacy /cookie, dichiara sitemap
- `public/downloads/cv.pdf` + `press-kit.pdf` — **stub** "in preparazione" (~100 KB ciascuno, generati con Chrome headless)
- `src/assets/images/gm/` — 4 immagini reali di Gabriella (portrait-1, portrait-2, video-poster, blog) + logo SVG

### Sistema motion

- **Stratigraphic unearthing** (firma del sito): clip-path + filter blur +
  letter-spacing + opacity sui `.word` spans + ground-line scaleX + bg image
  clip sync
- **Variable Bodoni** wght 400→700 in scrub sui titoli `[data-vary]`
- **Scroll-progress bar** 2 px gold in cima (fade-in dopo 80 px scroll)
- **Cover hover** scale 1.04 sulle entries archive
- Curtain veils, page entry, scroll reveal bidirezionale
- Reduced-motion guard via inline pre-paint script

### Content (entries MDX)

In `src/content/`:
- 2 **reali**: `scrittura/2020-criminologi-criminalisti.mdx` (UTES 2020),
  `scrittura/2023-linguaggio-corpo-rassegna-arma.mdx`
- 3 **placeholder espliciti**: televisione/2024-quarto-grado, formazione/2024-scuola-atene,
  incontri/2024-conferenza — da sostituire

---

## Punto vivo / cosa resta da fare

### Sul codice (priorità: vedere prima il feedback di Gabriella)

Niente di urgente. Il sito è in stato **show-to-client**. Eventuali interventi:
- Eventuale OG image dedicato (oggi è il ritratto)
- Eventuale offuscamento email su footer (oggi `mailto:` in chiaro)

### Sui contenuti (gap reali)

1. **3 entries Media reali** in sostituzione dei placeholder:
   - 1× apparizione TV (es. Quarto Grado, La Vita in Diretta, Storie Italiane…)
   - 1× corso/percorso formativo Scuola di Atene
   - 1× evento/conferenza pubblica recente
2. **CV completo PDF** (oggi è stub Bodoni-flavoured)
3. **Press kit PDF** (oggi è stub)
4. Eventuali altre entries `scrittura/` se ci sono altri articoli/saggi

### Decisioni operative aperte

- **Dominio definitivo + deploy Vercel:** non ancora collegato. Da
  configurare quando Gabriella approva.
- **Email di management protetta da scraping:** da decidere se serve.
- **Tracking analytics:** v1 dichiarata zero (no GA, no Pixel). Da
  confermare a regime.

---

## Riferimenti chiave (apri questi se devi rimettere mano)

| Cosa cerchi | Dove sta |
|---|---|
| Disciplina brand e copy | `CLAUDE.md` + `.claude/skills/arche-brand/SKILL.md` |
| Brief originale Gabriella | `docs/copy-brief.md` |
| Documento di regia archè | `docs/regia.html` |
| Layout globale + scroll progress + skip-link | `src/layouts/Base.astro` |
| Header (con fix mobile menu) | `src/components/Header.astro` |
| Footer (con Davide Tosi referente) | `src/components/Footer.astro` |
| Motion runtime | `src/scripts/home-motion.ts` |
| Schema content collections | `src/content/config.ts` |
| Detail page Media | `src/pages/media/[type]/[slug].astro` |
| Pagina light (esempio bodyClass) | `src/pages/perizie.astro` |

---

## Punteggio onesto (al momento dello stop)

**8.7 / 10**

- Architettura/codice: 9.5
- Brand & copy: 9.0
- Motion/UX: 8.5
- Performance (Lighthouse mobile 95–98): 9.0
- Completezza contenuti: 7.0 ← il 30 % che separa dall'8.7 dal 10
- Accessibilità (96, non 100, per ghost words decorativi): 9.0

Quando entrano i 3 contenuti reali + i 2 PDF veri, il sito sale a **9.5+**
senza toccare codice.

---

## Riferimenti commit recenti (per orientarsi)

```
cb30bde feat(contacts+motion): Davide Tosi management referent + scroll progress + cover hover
a9b838d feat(downloads): press kit + CV download CTAs
66b695e feat(motion): variable Bodoni weight scrubs as title enters viewport
78395c7 feat(media): detail pages per entry — /media/[type]/[slug]
9468c3a feat(media+footer): editorial cards with cover slot + readable footer bar
b2c4639 fix(header): mobile menu overlay was clipped by header backdrop-filter
1a85c8a feat(seo+a11y): favicon, robots, og default, skip link, real affiliation URLs
e79ce71 feat(home): light pull-quote interlude — color rhythm break
d500795 fix(responsive): word wrap on all titles + /perizie article layout
8a66877 feat(transitions): re-enable view-transition name-match morphs
40b41b5 feat(media): sub-pages read content collections + sample entries
3f2c7a6 feat(media): real /media hub — 4 cards to sub-pages
c00bd51 feat(perizie): light page (warm bone bg, ink text) + Base bodyClass
f84a70e feat(home): affiliazioni section — institutional credibility
c1fcd6c feat(contatti): real /contatti + /privacy + /cookie stubs
03d2402 feat(chrome): global Header + Footer
6ea88cd feat(motion): stratigraphic unearthing — the site's signature reveal
```

---

## Per ripartire in una nuova sessione

1. Apri il progetto: `cd ~/Projects/arche-studio/gabriella-marano-site`
2. Sincronizza: `git fetch && git checkout feature/home-cinematic && git pull`
3. Installa se serve: `pnpm install`
4. Dev: `pnpm dev` (porta 4321); build: `pnpm build`; preview: `pnpm preview`
5. Leggi questo file + `CLAUDE.md` per allineare il tono
6. Chiedi a Ivano se Gabriella ha dato feedback o se sono arrivati i
   contenuti reali (3 entries + CV + press kit)
