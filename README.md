# Proxima Urban — company website

Static website for an urban consulting practice advising municipalities, metropolitan authorities and regional governments on:

1. Urban resilience planning
2. 15-minute city and proximity planning
3. One Health City certification (OHC)
4. Green affordance: public green space within 300 m

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Single-page site: hero, mandate, service lines, OHC certification structure, approach, reference frameworks, founders, contact |
| `styles.css` | Neo-brutalist design system: 2 px rules, rounded corners (radius scale), hard offset shadows, Space Grotesk display type, IBM Plex Mono labels, single neon blue accent; light and dark schemes; responsive breakpoints; all CSS animations |
| `script.js` | Scroll reveal (IntersectionObserver), animated counters, active-section navigation, header hide on scroll, reading progress bar, mobile navigation, contact form (mailto fallback) |
| `assets/` | Founder photographs |

No build step or dependencies. Fonts are loaded from Google Fonts; everything else is self-contained and runs on any static host, including GitHub Pages.

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

## Items to adjust before launch

- **Company name**: "Proxima Urban" is a working name. It appears in `index.html` (title, header, hero, footer) and in `README.md`.
- **Contact email**: `contact@proximaurban.eu` appears in `index.html` (contact section, form action) and in `script.js`.
- **Founder biographies**: the Team section. Written from the public profiles at ICS-ULisboa and the Institute of Landscape Architecture, Leibniz Universität Hannover; confirm wording with both founders. Photos are in `assets/` (joint photo plus two square crops generated from it); replace with individual portraits if preferred.
- **Offices and languages**: contact section.
- **Contact form**: currently composes an email via `mailto:`. Replace the handler in `script.js` with a form service endpoint (Formspree, Netlify Forms, or a municipal-grade alternative) for production use.
- **One Health City certification**: the five domains and three levels are a proposed structure for the firm's own framework. Review thresholds and verification procedures before publication.
