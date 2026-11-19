# Lexio website

The landing page for [Lexio](https://github.com/thistinct/Lexio), served at **https://lexio.thistinct.tools**.

It's a plain static site with no build step: `index.html`, `styles.css`, `script.js` and `assets/`. Open `index.html` in a browser to preview it.

## Hosting

GitHub Pages, deploying from the `main` branch, root folder. `CNAME` sets the custom domain and `.nojekyll` tells Pages to serve the files as they are.

DNS: a `CNAME` record for `lexio` in the `thistinct.tools` zone pointing to `thistinct.github.io`.

## Updating

- App icon sizes in `assets/` come from `Support/Icon/AppIcon.icns` in the app repo.
- `assets/og.jpg` is the image shown when the link is shared.
- The download button is a "coming soon" placeholder until signed builds exist. When they do, point the buttons with `href="#get"` and the one in the `#get` section at the download.
- Keep the copy in step with the app: features, tested apps and requirements are taken from the app's README, CHANGELOG and Settings text.
