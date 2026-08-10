# Pride Invests — website

## Folder structure
```
prideinvests/
├── index.html                  # Landing page (hero slideshow + home sections)
├── css/
│   └── main.css                # Design system + all landing styles
├── js/
│   └── main.js                 # Preloader, slideshow engine, nav, scroll reveals
├── media/
│   ├── logo.jpeg
│   └── landing/
│       ├── bg_car.mp4 / bg_treadmill.mp4 / bg_clouds.mp4 / bg_lights.mp4
│       │                       # hero background videos (motion-interpolated ~2x slow-mo)
│       ├── poster_*.jpg        # first-frame posters for instant paint
│       └── landing_*.jpg       # stills (used on project cards / fallbacks)
├── projects/
│   ├── index.html              # /projects/
│   ├── yarzeh-mansions/index.html    # /projects/yarzeh-mansions/
│   └── louayzeh-village/index.html   # /projects/louayzeh-village/
├── our-story/index.html        # /our-story/
├── faq/index.html              # /faq/
├── contact/index.html          # /contact/
├── sitemap.xml
└── robots.txt
```
Preview with a local server from the project root (links are root-relative):
    python3 -m http.server 8000
then open http://localhost:8000/ — pages resolve to clean URLs like
/projects/yarzeh-mansions/ with no .html anywhere.

## Project status options (for the CMS)
Each project shows its status in two places. The three supported statuses:

1. **Under construction / upcoming** — badge shows the delivery date:
   `<span class="pcard-badge">Delivery · Dec 2027</span>` (cards)
   `<span class="fv">Under construction</span>` (fact strip)
2. **Delivered but not Sold Out** — not used by any current project;
   reserved so the CMS can set it later:
   `<span class="pcard-badge delivered-not-sold">Delivered but not Sold Out</span>` (cards)
   `<span class="fv fv-delivered-not-sold">Delivered but not Sold Out</span>` (fact strip)
3. **Delivered & Sold Out**:
   `<span class="pcard-badge sold">Delivered &amp; Sold Out</span>` (cards)
   `<span class="fv fv-sold">Delivered &amp; Sold Out</span>` (fact strip)

## Development & CMS (Eleventy)
The site now builds from `src/` with Eleventy. Page templates live in `src/**/index.njk`;
shared blocks in `src/_includes/` (nav, footer, rail, action-bar, location); global contact
details in `src/_data/site.json`; the apartment inventory in `src/_data/units.json`
(it generates `/js/units-data.js` at build). Cache-busting `?v=` values are stamped
automatically per build — never bump them by hand.

Local development: `npm install` once, then `npx @11ty/eleventy --serve` and open the
printed localhost URL. The deployable site is generated into `_site/` (Netlify runs the
same via `netlify.toml`). The client editing UI is at `/cms/` (Decap CMS) — enable
Netlify Identity + Git Gateway per the setup guide, then invite users. Site settings and
the full unit inventory are editable there today; per-page copy extraction into CMS
collections is the next planned pass.
