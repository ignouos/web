# Open Source — IGNOU website

A responsive static website built with plain HTML, CSS, and JavaScript.

## Features
- Live public repository listing from the GitHub REST API for `ignouos`
- Automatic pagination so larger organizations are not limited to the first 100 repositories
- Search by repository name or description
- Filter by programming language
- Repository stars, forks, language, last-updated date, issue and contribution links
- Public metadata activity overview
- Resource links and beginner contribution guide
- Mobile navigation with Escape-key support, accessible labels, and loading/error/empty states
- Local cache (10 minutes), bounded request timeouts, and cached fallback for API limits/network errors

## Run locally
Open `index.html` in a browser. For a local server, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Contributing
Bug reports, accessibility improvements, documentation updates, and focused code changes are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations. Please use the repository issue templates when reporting a bug or suggesting an improvement. Security reports are handled privately as described in [SECURITY.md](SECURITY.md).

## License
This project is licensed under the [MIT License](LICENSE).

## Project files
- `index.html` — page content and structure
- `style.css` — responsive visual styles
- `app.js` — repository loading, filtering, and activity summaries

The site has no build step or package dependencies. Changes can be previewed with the local server above.

## Deploy with GitHub Pages
1. Create a repository for the website (for example, `website`).
2. Upload `index.html`, `style.css`, and `app.js` to the repository root.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`, then save.

The page uses GitHub's unauthenticated public API; rate limits may apply. No API token is embedded in the site.

## Disclaimer
Open Source — IGNOU is an independent, student-led initiative and is not officially affiliated with or endorsed by IGNOU or GitHub.
