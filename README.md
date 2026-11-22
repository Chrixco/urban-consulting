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
| `styles.css` | Layout, typography, light and dark colour schemes, responsive breakpoints |
| `script.js` | Mobile navigation, footer year, contact form (mailto fallback) |

No build step or dependencies. Fonts are loaded from Google Fonts; everything else is self-contained.

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
- **Founder biographies**: the Team section. Written from the public profiles at ICS-ULisboa and the Institute of Landscape Architecture, Leibniz Universität Hannover; confirm wording with both founders. Portrait images can replace the initials badges (`.person-initials`).
- **Offices and languages**: contact section.
- **Contact form**: currently composes an email via `mailto:`. Replace the handler in `script.js` with a form service endpoint (Formspree, Netlify Forms, or a municipal-grade alternative) for production use.
- **One Health City certification**: the five domains and three levels are a proposed structure for the firm's own framework. Review thresholds and verification procedures before publication.
