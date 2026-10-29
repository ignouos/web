# Contributing

Thanks for helping improve Open Source — IGNOU. Contributions can include bug fixes, accessibility improvements, clearer content, documentation, and small enhancements to the site.

## Before you start

- Check existing issues and pull requests for related work.
- For a larger change, open an issue first so the scope can be discussed.
- Keep changes focused and preserve the existing visual style unless the change specifically addresses a design issue.

## Make a change

1. Fork the repository and create a branch for your change.
2. Edit the relevant files: `index.html` for page content, `style.css` for styling, and `app.js` for behavior.
3. Run the site locally with `python3 -m http.server 8000` and open `http://localhost:8000`.
4. Check the page at desktop and mobile widths. For JavaScript changes, check the browser console and the repository loading, search, language filter, refresh, and mobile navigation.
5. Commit your changes with a short, clear message and open a pull request against `main`.

## Pull request checklist

- Explain what changed and why.
- Link the related issue, if there is one.
- Include screenshots for visible design changes.
- Confirm links work and the page remains usable on a narrow screen.
- Do not add API tokens, private keys, or other secrets.

There is no build step or dependency installation for this site. Please mention any checks you performed and anything you could not verify.
