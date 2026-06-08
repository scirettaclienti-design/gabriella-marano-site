# Gabriella Marano — Riepilogo sessione e punto di ripartenza

> File-bussola per riaprire il lavoro al volo in una nuova sessione di Claude
> Code. Lo legge la prossima istanza dell'assistente; lo legge anche Ivano
> per capire al colpo d'occhio dove siamo.

---

## TL;DR (3 righe)

Sito istituzionale Gabriella Marano (Astro 5 + design system archè) **completo
in struttura** (18 pagine), branch `main` allineato a `feature/home-cinematic`,
push GitHub OK. **Deploy Vercel — auth GitHub Packages risolta** (env var
`GH_PKG_TOKEN`), ma al momento dello stop l'URL di produzione
`gabriella-marano-site.vercel.app` restituisce `DEPLOYMENT_NOT_FOUND`:
da verificare sulla pagina Deployments di Vercel se il deploy è ancora in
Building o è uscito come Preview anziché Production.

---

## Stato live (l'ultima cosa che era aperta)

- **Branch attivo:** `feature/home-cinematic`
- **HEAD di `main`:** `68fd2b9` (= `chore: trigger Vercel deploy on latest main (token env renamed)`)
- **Vercel build:** ha smesso di fallire dopo aver rinominato la env var da `NPM_TOKEN` → `GH_PKG_TOKEN`, ma `gabriella-marano-site.vercel.app` mostra **404 / DEPLOYMENT_NOT_FOUND**.

**Prossima azione concreta da fare** (la stavamo per fare quando ci siamo fermati):
1. Vercel → **Deployments** → guardare il deploy in cima alla lista
2. Verificare **Status** (Building / Ready / Failed), etichetta **Production o Preview**, e **commit** (deve essere `68fd2b9` o successivo)
3. Se è Ready ma è Preview, aprire l'URL `…-git-main-…vercel.app` o promuoverlo a Production. Se è Building, aspettare. Se è Failed, leggere il log nuovo.

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
  pubblicato su **GitHub Packages npm** (`npm.pkg.github.com`).
  ⚠️ **Anche se è "public"**, GitHub Packages npm **richiede comunque
  autenticazione** — è una specificità di GitHub diversa da `npmjs.org`.
  Vedi sezione "Deploy / Vercel" più sotto per come è cablato il token.
- **Motion:** GSAP 3.15 + ScrollTrigger + Lenis 1.3 (solo home opening)
- **Content Collections** (Zod): televisione / scrittura / formazione / incontri
- **View Transitions** Astro con name-match morphs (`vt-arche-heading`,
  `vt-storia-heading`)
- **Deploy target:** Vercel
- **Repo:** https://github.com/scirettaclienti-design/gabriella-marano-site
- **Branch attivo:** `feature/home-cinematic` (merged into `main` via ff)

---

## Deploy / Vercel — setup definitivo (perché c'è quella riga nel `.npmrc`)

### Il problema
Il design system è su GitHub Packages npm. Quando Vercel fa `pnpm install`,
ogni richiesta a `npm.pkg.github.com` deve portare un header
`Authorization: Bearer <token>`. Senza token → `ERR_PNPM_FETCH_401`.

### Il falso amico: `NPM_TOKEN`
Vercel ha una "magic variable": **se trova una env var chiamata `NPM_TOKEN`,
la auto-attacca automaticamente a `registry.npmjs.org`** (l'npm pubblico),
non a `npm.pkg.github.com`. Risultato: il token c'è nel log
(`//registry.npmjs.org/:_authToken=ghp_[hidden]`) ma è nel posto sbagliato,
e GitHub Packages continua a dare 401.

### La soluzione attuale (in repo)
1. `.npmrc` contiene esattamente questo:
   ```
   @scirettaclienti-design:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GH_PKG_TOKEN}
   ```
2. Su Vercel → Settings → Environment Variables c'è la sola variabile
   **`GH_PKG_TOKEN`** (Sensitive, Production + Preview), con valore =
   Personal Access Token GitHub classic, scope `read:packages`.
3. **Non** esiste più `NPM_TOKEN` su Vercel — il nome generico va evitato.

### Errori vissuti e perché (lezione, non ripeterli)
- ❌ Pensare che "rendere pubblico il package" risolva da solo → no, GitHub
  Packages npm chiede auth anche per i public.
- ❌ Chiamare la variabile Vercel `NPM_TOKEN` → Vercel la dirotta su
  `registry.npmjs.org`, fa apparire l'auth nel log ma sull'host sbagliato.
- ❌ Cliccare "Redeploy" sui tre puntini di un deploy fallito vecchio in
  Deployments → ribuilda lo **stesso commit fallito** (era `bd0027a`),
  ignorando i commit nuovi su `main`. Il Redeploy giusto è quello del
  banner "A new deployment is needed" in Settings → Environment Variables,
  che parte dall'ultimo commit del production branch.

### Come triggerare un deploy pulito d'ora in poi
- Pusha sul branch production (oggi: `main`) e Vercel parte da solo
- Oppure (senza modifiche reali) `git commit --allow-empty -m "..." && git push origin main`
- Oppure cliccare il **Redeploy** dal banner di Settings → Env Vars
  (NON dai tre puntini di un deploy specifico in Deployments)

---

## Cosa è già fatto e in repo

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
| `/contatti` | ✅ 3 canali (Stampa/Incarichi/Formazione) + **Davide Tosi referente management** (+39 333 243 7962) + emergency 24h |
| `/privacy`, `/cookie` | ✅ Stub legali |

### Asset pubblici

- `public/favicon.svg` — ✦ archè star gold on ink
- `public/og.jpg` — ritratto editoriale (~80 KB)
- `public/robots.txt` — allows /, disallows /privacy /cookie, dichiara sitemap
- `public/downloads/cv.pdf` + `press-kit.pdf` — **stub** "in preparazione" (~100 KB ciascuno)
- `src/assets/images/gm/` — 4 immagini reali di Gabriella + logo SVG

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

## Cosa resta da fare

### Priorità 1 — chiudere il deploy
- Verificare lo stato del deploy Vercel del commit `68fd2b9` su `main`
- Quando il deploy è Ready + Production, controllare visivamente le 18 pagine
- Mandare l'URL a Gabriella per feedback

### Priorità 2 — contenuti reali (questo è il gap che separa il sito dall'eccellenza)
1. **3 entries Media reali** in sostituzione dei placeholder:
   - 1× apparizione TV
   - 1× corso/percorso formativo Scuola di Atene
   - 1× evento/conferenza pubblica recente
2. **CV completo PDF** (oggi è stub Bodoni-flavoured)
3. **Press kit PDF** (oggi è stub)
4. Eventuali altre entries `scrittura/`

### Decisioni operative aperte
- **Dominio definitivo** (es. `gabriellamarano.it`): da collegare su Vercel quando pronto
- **Email management protetta da scraping?** Oggi `mailto:` in chiaro su 18 pagine
- **Tracking analytics:** v1 dichiarata zero (no GA, no Pixel). Da confermare

---

## Riferimenti chiave (apri questi se devi rimettere mano)

| Cosa cerchi | Dove sta |
|---|---|
| Disciplina brand e copy | `CLAUDE.md` + `.claude/skills/arche-brand/SKILL.md` |
| Brief originale Gabriella | `docs/copy-brief.md` |
| Documento di regia archè | `docs/regia.html` |
| Setup auth GitHub Packages | `.npmrc` (riga `${GH_PKG_TOKEN}`) + questa sezione "Deploy / Vercel" |
| Layout globale + scroll progress + skip-link | `src/layouts/Base.astro` |
| Header (con fix mobile menu) | `src/components/Header.astro` |
| Footer (con Davide Tosi referente) | `src/components/Footer.astro` |
| Motion runtime | `src/scripts/home-motion.ts` |
| Schema content collections | `src/content/config.ts` |
| Detail page Media | `src/pages/media/[type]/[slug].astro` |
| Pagina light (esempio bodyClass) | `src/pages/perizie.astro` |

---

## Punteggio onesto (al momento dello stop)

**8.7 / 10** sulla qualità del sito (non sul deploy che è in corso di sblocco).

- Architettura/codice: 9.5
- Brand & copy: 9.0
- Motion/UX: 8.5
- Performance (Lighthouse mobile 95–98): 9.0
- Completezza contenuti: 7.0 ← il 30 % che separa l'8.7 dal 10
- Accessibilità (96, non 100, per ghost words decorativi): 9.0

Quando entrano i 3 contenuti reali + i 2 PDF veri, il sito sale a **9.5+**
senza toccare codice.

---

## Riferimenti commit recenti

```
68fd2b9 chore: trigger Vercel deploy on latest main (token env renamed)   ← HEAD di main
7d726b7 fix(deploy): rename token env var to GH_PKG_TOKEN to bypass Vercel's NPM_TOKEN auto-mapping
399be9f fix(deploy): package is public now — drop token, drop the whole problem (ROLLBACKATO da 7d726b7)
570a469 fix(deploy): read GitHub Packages token from NPM_TOKEN env var (PRIMO TENTATIVO, NON FUNZIONÒ)
d7eae3f docs(resume): add RESUME.md + RESUME.txt for session handoff
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
   (oppure `main` se vuoi vedere il production code)
3. Installa se serve: `pnpm install` (in locale funziona grazie al token in `~/.npmrc` globale)
4. Dev: `pnpm dev` (porta 4321); build: `pnpm build`; preview: `pnpm preview`
5. Leggi `CLAUDE.md` per allineare il tono
6. **Prima cosa da chiedere a Ivano:** è andato in porto il deploy Vercel del commit `68fd2b9`? Il dominio `gabriella-marano-site.vercel.app` risponde? Se sì, Gabriella ha dato feedback?
7. Se il deploy è ancora bloccato, leggi la sezione "Deploy / Vercel" qui sopra prima di proporre qualcosa.
