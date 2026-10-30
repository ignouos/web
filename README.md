# Open Source — IGNOU

A student-led, open-source community for learning, building, and contributing together. This project is a responsive static website built with semantic HTML, CSS, and native JavaScript ES modules. It has no build step, backend, or package dependencies.

## What the website does

- Loads all public repositories from the `ignouos` GitHub organization, following API pagination.
- Caches repository metadata in local storage for ten minutes and falls back to the last saved response when GitHub is unavailable or rate limited.
- Searches projects by name and description; filters by language; sorts by update time, stars, forks, or name.
- Shows repository details, metadata, an optional README preview, and direct links to issues and GitHub’s “good first issue” search.
- Summarizes public repository, star, fork, language, and recent push metadata. It does not estimate historical growth or activity that the API does not provide.
- Provides searchable, categorized learning resources and a contribution roadmap with a locally saved checklist.
- Includes global search (`Ctrl/⌘ K`), a saved light/dark theme, mobile navigation, keyboard-accessible dialogs, status feedback, and a reduced-motion-aware canvas illustration.

The canvas illustration uses a small native 2D canvas with perspective projection and pointer response. It pauses when off-screen or when the document is hidden, and becomes static when reduced motion is requested. The design uses CSS glass surfaces with opaque fallbacks; external Three.js, GSAP, and other runtime packages are not required.

## Run locally

Serve the repository root over HTTP so the browser can load JavaScript modules:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly as a `file://` URL is not supported for ES modules.

## Project structure

- `index.html` — semantic page layout, controls, and dialogs.
- `style.css` — stylesheet entry point.
- `css/main.css` — design system, components, responsive layout, and reduced-motion rules.
- `js/app.js` — application startup and repository refresh flow.
- `js/github-api.js` — GitHub REST API pagination, timeout handling, and local cache.
- `js/repositories.js` — project filtering, sorting, cards, and detail dialog.
- `js/dashboard.js` — public activity summaries.
- `js/resources.js` — curated learning resource catalog and category/search filters.
- `js/search.js` — global project/resource search and keyboard shortcut.
- `js/navigation.js` — mobile navigation, local preferences, section reveals, and toasts.
- `js/hero-canvas.js` — lightweight interactive community network illustration.

## GitHub API and privacy

The site calls GitHub’s unauthenticated public REST API for `ignouos`. Public API rate limits apply. No API token, account, server, or private contribution data is used. Repository metadata and the theme/checklist preferences are stored in browser local storage; no personal profile or database is created. The optional project README preview makes an additional public API request when a detail dialog is opened.

## Contributing

Bug reports, accessibility improvements, documentation, and focused code changes are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and use the repository issue templates. Report suspected security issues privately as described in [SECURITY.md](SECURITY.md).

When changing the site, check the page at desktop and mobile widths, test project loading/search/filter/sort/refresh, open a project dialog, and try keyboard navigation and reduced-motion settings. There is no dependency installation or build step.

## License and affiliation

This project is licensed under the [MIT License](LICENSE). Open Source — IGNOU is an independent, student-led initiative and is not officially affiliated with or endorsed by IGNOU or GitHub.
