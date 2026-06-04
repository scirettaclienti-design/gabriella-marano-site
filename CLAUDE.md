# Gabriella Marano — Sito ufficiale

## Identità
Sito istituzionale di Gabriella Marano: psicologa clinica e forense,
criminologa, archeologa. Pubblico primario: magistrati, avvocati,
giornalisti, editori, organizzatori di formazione. Pubblico
secondario: pubblico curioso che approda da archè.

## Stack
- Astro 5 + TypeScript (strict) + Tailwind 3 + MDX
- Content Collections per: televisione, scrittura, formazione, incontri
- Design system: @scirettaclienti-design/arche-design-system
  (GitHub Packages). Path alias @arche/* nei consumer.
- Self-hosted fonts via design system (no Google Fonts CDN)
- Deploy: Vercel
- Animazioni: GSAP + Lenis SOLO su home (apertura cinematografica)
- No tracking pixel v1 (no GA, no Facebook Pixel)

## Sitemap
- /                   Home, apertura cinematografica in tre atti
- /storia             Bio editoriale, due colonne
- /metodo             Tre principi + concretezza del lavoro
- /perizie            Pagina "fredda" per magistrati e avvocati
- /media              Hub
- /media/televisione  Rassegna cronologica filtrabile
- /media/scrittura    Libri + pubblicazioni
- /media/formazione   Corsi + La Scuola di Atene
- /media/incontri     Eventi pubblici
- /arche              Landing ponte verso archecrime.com
- /contatti           Tre canali distinti (stampa, perizie, formazione)

## Disciplina copy (dal documento di regia)
- Niente lista nominale di casi reali in home né in bio
- Apparizioni TV come archivio editoriale, non bacheca di trofei
- Archeologia in apertura, mai relegata a nota
- Tono = registro archè meno 30% di drama: sobrio, autorevole, asciutto
- Mai H1 in pagine diverse dalla home

## Disciplina visiva
- Solo Bodoni Moda (display) + Spectral (body)
- Cormorant Garamond riservato a: numeri di sezione, maiuscolette museali
- Grain overlay sempre attivo (già nel design system)
- Niente carousel, niente accordion, niente parallax gratuito
- Apertura cinematografica solo home, ridotta su mobile

## Performance target
- Lighthouse 95+ mobile su ogni pagina
- LCP < 2.0s su 4G simulato
- CLS = 0
- Total JS < 50kb gzipped (escluso GSAP/Lenis, solo home)

## SEO
- Title pattern: "{Pagina} — Gabriella Marano"
- Meta description scritta a mano per ogni pagina
- Schema.org Person + ProfessionalService
- Sitemap.xml + OG image custom per pagina
- Redirect 301 dei vecchi anchor Elementor (vercel.json)

## Documenti di riferimento (in ordine di autorità)
1. docs/regia.html — documento di regia archè, verità ultima
2. .claude/skills/arche-brand/SKILL.md
3. Questo file

## Quando in dubbio
Chiedi via commento. Non inventare componenti decorativi fuori dal
design system. Non aggiungere librerie senza approvazione esplicita.
