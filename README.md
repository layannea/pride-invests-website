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
