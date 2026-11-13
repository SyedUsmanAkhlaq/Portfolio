# Usman Akhlaq · Portfolio

Personal site for Usman Akhlaq, Senior Software Engineer (Flutter + Django REST), Lahore.

A single static page with no build step and no dependencies, so it runs as-is on GitHub Pages, Netlify or Vercel.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)`.
The site goes live at `https://syedusmanakhlaq.github.io/Portfolio/`.

## Structure

```
index.html            All content: hero, projects, experience, skills, contact
assets/css/site.css   Page layout and type (tokens at the top)
assets/css/demos.css  The animated product mockups, scoped under .stage
assets/js/demos.js    Mockup choreography: one script of beats per demo
assets/js/icons.js    Icon set (Lucide outlines) and the iOS status bar
assets/img/github.svg GitHub mark
```

## Editing

- **Text** lives in `index.html`. Each project is one `<article class="project">`.
- **A new project:** copy an `<article>`. A mockup is optional; without one, drop the `project__demo` block.
- **Colours:** `--accent` and the other tokens at the top of `site.css`.
- **Mockups:** each `.stage` has a fixed design size (`data-w`, `data-h`) and is scaled to its column. Window demos also have a compact design for phones (`data-cw`, `data-ch`, styled under `.is-compact`). A demo's script in `demos.js` has `reset`, `poster` (the frame shown with reduced motion) and `run`.

The mockups follow the [Stageshow](https://github.com/benjitaylor/skills) method: a believable screen, real words only where the story is, one gutter, and every motion with a cause. They are illustrations, not screenshots.
