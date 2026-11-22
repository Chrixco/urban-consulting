# Proxima Urban — company website

Static website for an urban consulting practice advising municipalities, metropolitan authorities and regional governments through two service lines:

1. **One Health City assessment**: proximity, exposure and biodiversity indicators, based on the One Health City framework developed at the Institute of Landscape Architecture, Leibniz Universität Hannover. Includes 15-minute and 300 m green space benchmarks.
2. **Climate resilience and nature-based solutions planning**: multi-scalar resilience strategy, planning instrument review and nature-based solutions with cost–benefit comparison.

## Page structure

Hero · cost-of-inaction figures · mandate · 01 service lines · 02 value for the city (sourced economic evidence, Copenhagen case, savings mechanisms) · 03 One Health City framework · 04 approach · 05 reference frameworks · 06 founders · 07 why contact us · 08 contact.

All economic and health figures on the page link to their published source. Update them if newer editions are released.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Single-page site: hero, mandate, service lines, OHC certification structure, approach, reference frameworks, founders, contact |
| `styles.css` | Neo-brutalist design system: 2 px rules, rounded corners (radius scale), hard offset shadows, Space Grotesk display type, IBM Plex Mono labels, single neon blue accent; light and dark schemes; responsive breakpoints; all CSS animations |
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

## Responsiveness

Tested with Playwright on 320 px phones, iPhone SE, iPhone 13 (portrait and landscape), Pixel 7, iPad Mini, iPad Pro 11 (landscape), 1280, 1920 and 2560 px screens: no horizontal overflow, no clipped elements, no failed requests. Content is centred at a maximum width of 1440 px on wide screens, hover effects are disabled on touch devices, and safe-area insets are respected on notched phones.
