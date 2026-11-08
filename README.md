# Lavanya Srivastava — Portfolio

Source for [lavanya-portfolio.vercel.app](https://lavanya-portfolio.vercel.app/): AI developer, educator and consultant.

A single static page (`index.html`) with no build step. Vercel deploys it automatically on every push.

## Project presentations

`present/` holds one browser presentation per flagship project, with an animated architecture flow (press → to step through it, P to play, F for full screen) and a PDF copy for email. Slide content lives in each page's `window.DECK` data; the shared engine is `present/deck.js` and `present/deck.css`.

## Edit

Open `index.html` and change the text. Images are in `assets/`.

## Preview locally

```bash
python -m http.server 8000
# then open http://localhost:8000
```

© 2026 Lavanya Srivastava
