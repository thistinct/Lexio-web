# Lexio website

The landing page for [Lexio](https://github.com/thistinct/Lexio), served at **https://lexio.thistinct.tools**.

It's a plain static site with no build step: `index.html`, `styles.css`, `script.js` and `assets/`. Open `index.html` in a browser to preview it.

## Hosting

GitHub Pages, deploying from the `main` branch, root folder. `CNAME` sets the custom domain and `.nojekyll` tells Pages to serve the files as they are.

DNS: a `CNAME` record for `lexio` in the `thistinct.tools` zone pointing to `thistinct.github.io`.

## Updating

- App icon sizes in `assets/` come from `Support/Icon/AppIcon.icns` in the app repo.
- `assets/og.jpg` is the image shown when the link is shared.
- Downloads: the app repo's Release workflow publishes each version as a release on this repository (`Lexio-X.Y.Z.dmg`, plus `Lexio.dmg` under a fixed name). `script.js` asks GitHub for the latest release when the page loads (cached for an hour) and turns the elements marked `data-download` into download links. With no published release, or if GitHub can't be reached, the page keeps its "Coming soon" state. Drafts and pre-releases are ignored. The always-latest link is `https://github.com/thistinct/lexio-web/releases/latest/download/Lexio.dmg`.
- Keep the copy in step with the app: features, tested apps and requirements are taken from the app's README, CHANGELOG and Settings text.
