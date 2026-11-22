# Proxima Urban — company website

Static website for an urban consulting practice advising municipalities, metropolitan authorities and regional governments through two service lines supported by a scenario exploration service:

1. **One Health City assessment**: proximity, exposure and biodiversity indicators, based on the One Health City framework developed at the Institute of Landscape Architecture, Leibniz Universität Hannover. Includes 15-minute and 300 m green space benchmarks.
2. **Climate resilience and nature-based solutions planning**: multi-scalar resilience strategy, planning instrument review and nature-based solutions with cost–benefit comparison.
3. **Scenario exploration**: explorative climate, land use and population scenarios, spatial exposure modelling and adaptation pathways. A required step of resilience planning, applied to One Health City assessments, and available on its own.

## Page structure

Hero · cost-of-inaction figures · mandate · 01 service lines · 02 value for the city (sourced economic evidence, Copenhagen case, savings mechanisms) · 03 One Health City framework · 04 approach · 05 reference frameworks · 06 founders · 07 why contact us · 08 contact.

All economic and health figures on the page link to their published source. Update them if newer editions are released.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Single-page site: hero, mandate, service lines, OHC certification structure, approach, reference frameworks, founders, contact |
| `styles.css` | Neo-brutalist design system: 2 px rules, rounded corners (radius scale), hard offset shadows, Space Grotesk display type, IBM Plex Mono labels, single neon blue accent; light and dark schemes; responsive breakpoints; all CSS animations |
| `charts.js` | Interactive charts in plain SVG, no libraries: scenario explorer (IPCC AR6 sea level and warming), adaptation pathways, Copenhagen comparison, hero tooltips. Data and sources are at the top of the file |
| `script.js` | Scroll reveal (IntersectionObserver), animated counters, active-section navigation, header hide on scroll, reading progress bar, mobile navigation, contact form (mailto fallback) |
| `assets/` | Founder photographs, social share image, touch icons |
| `assets/fonts/`, `fonts.css` | Self-hosted fonts (latin subset, SIL Open Font License); no requests to Google |
| `imprint.html`, `privacy.html` | Legal notice and GDPR privacy policy (contain placeholders) |
| `404.html` | Not-found page for GitHub Pages |
| `robots.txt`, `sitemap.xml`, `site.webmanifest`, `.nojekyll` | Search, device and hosting metadata |

No build step or dependencies. Everything, fonts included, is self-contained and runs on any static host, including GitHub Pages. The site sets no cookies and loads no third-party resources.

## Motion

| Element | Behaviour |
| --- | --- |
| Hero headline | Line-by-line rise on load |
| Hero figure | Slow counter-rotating isochrone rings, expanding pulse at the 300 m ring, accent blink on green plots |
| Marquee strip | Continuous horizontal scroll; pauses on hover |
| Stat band | Numbers count up when scrolled into view |
| Sections | Staggered fade-and-rise reveal on scroll |
| Service cards, phases, standards | Hover colour inversion and hard-shadow lift |
| Header | Hides on scroll down, returns on scroll up; progress bar across the top |
| Footer wordmark | Outlined type fills with accent on hover |

All motion is disabled under `prefers-reduced-motion: reduce`; content is fully visible without JavaScript.

## Design tokens

Colours and type are defined once at the top of `styles.css`. To change the accent, edit `--accent` (currently neon blue, `#1f51ff`). To change the border weight used throughout, edit `--bw`. Corner rounding is set by `--radius` (panels), `--radius-sm` (buttons, inputs) and `--radius-pill` (labels, badges); set them to `0` to return to square corners.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

**GitHub Pages**: Settings → Pages → Source: *Deploy from a branch* → select the branch and `/ (root)`. The site is served at `https://<owner>.github.io/<repo>/`.

Any static host (Netlify, Vercel, Cloudflare Pages) works by pointing it at the repository root.

## Placeholders to fill before launch

Placeholders are shown in `[square brackets]` with a dashed blue outline (class `ph`). Search the HTML for `class="ph"` and `data-placeholder`. Once all are filled, delete the `.ph` rule in `styles.css`.

| Item | Where |
| --- | --- |
| Company legal name and legal form, registered address | Footer (all pages), `imprint.html`, `privacy.html` |
| VAT number, register court and number | Footer, `imprint.html` |
| Telephone | Footer, `imprint.html` (also the `tel:` link) |
| Function of representatives, person responsible for content | `imprint.html` |
| Photographer credit | `imprint.html` |
| Data transfer basis, retention period, supervisory authority | `privacy.html` |
| LinkedIn, Instagram, ResearchGate, YouTube URLs | Footer links with `data-placeholder` (all pages); remove any channel not used |
| Contact email `contact@proximaurban.eu` | Contact section, footer, legal pages, `script.js`, JSON-LD in `index.html` |
| Site URL `https://chrixco.github.io/urban-consulting/` | Canonical and Open Graph tags, `robots.txt`, `sitemap.xml`; update when a custom domain is used. `404.html` uses `<base href="/urban-consulting/">`; change to `/` on a custom domain |

The imprint and privacy texts are templates. Have them reviewed for the jurisdiction of the company's registered seat.

## Editorial style

Page copy follows the terminology and argument of Marques and Alvim, *From Global Goals to Periphery Realities: SDG 11, Metropolitan Fringes, and the Resilience Gap in São Paulo Metropolitan Region, Brazil* (preprint, Research Square, 2026, doi:10.21203/rs.3.rs-8467644/v1).

- **Implementation gap.** Not a lack of plans, but misalignment across governance scales and the translation, or neutralisation, of commitments in zoning categories, regulatory rules and institutional routines.
- **Planning disjunctions.** Situations in which commitments expressed in plans are weakened or contradicted by regulatory categories, institutional routines or spatial decisions.
- **Resilience as transformation.** Not incremental risk management: change in land-use regimes, rules and incentives, and in governance relations across scales.
- **Analytical framework.** Four dimensions: governance, ecological, urban, socioeconomic.
- **Method terms.** Triangulation of document analysis, spatial evidence and interviews; harmonised zoning mosaic; plan alignment audit; verifiable territorial outcomes (e.g. annual change in ecological connectivity, share of permits issued in low-risk areas).
- **Voice.** Direct, declarative sentences; concepts defined on first use ("understood as"); no promotional adjectives; claims tied to instruments, scales and outcomes.

## Charts and proportions

- **Scenario explorer.** Plots IPCC AR6 WGI medians and ranges for SSP1-2.6, SSP2-4.5 and SSP5-8.5: sea-level rise (likely range, relative to 1995–2014) and warming (very likely range, relative to 1850–1900). The selected scenario is shown in the accent colour with its range band; the others stay grey with direct labels. Controls, hover, keyboard (arrow keys) and a data table give the same values.
- **Adaptation pathways.** Illustrative measures and tipping points, after Haasnoot et al. (2013). Replace `MEASURES` and `TRANSFERS` in `charts.js` with values from a real study.
- **Colour.** One accent only. Chart blue is `#1f51ff` in light mode and `#6585ff` in dark mode; both pass contrast and lightness checks against the chart surfaces.
- **Golden ratio (φ ≈ 1.618).** Used for the main two-column layouts (hero, mandate, value, scenario readout, wide service card, contact, footer), the founders photo, and chart proportions (width : height = φ).

## Responsiveness

Tested with Playwright on 320 px phones, iPhone SE, iPhone 13 (portrait and landscape), Pixel 7, iPad Mini, iPad Pro 11 (landscape), 1280, 1920 and 2560 px screens: no horizontal overflow, no clipped elements, no failed requests. Content is centred at a maximum width of 1440 px on wide screens, hover effects are disabled on touch devices, and safe-area insets are respected on notched phones.

Spacing follows shared tokens in `styles.css`: `--gutter` for page margins (16 px on phones, centred at 1440 px on wide screens), `--pad-card` for cells, panels and forms (20 to 32 px), and `--pad-card-lg` for service, founder and case cards (24 to 40 px). Touch targets are at least 44 px on touch screens. A Playwright audit confirms on all ten device profiles that every section aligns to the gutter, no text sits within 12 px of the screen edge, and no tap target is smaller than 40 px.
