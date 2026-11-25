# silvermoon-legend
銀月傳說 網頁 RPG

Standalone static site for the 銀月傳說 canvas game. The published URL is [https://eternalfire009-bit.github.io/silvermoon-legend/](https://eternalfire009-bit.github.io/silvermoon-legend/). Saves stay in the browser (`localStorage`, IndexedDB database `silvermoon-db`, and cookies) on that origin, so they persist across visits.

## Run locally

```bash
npm install
npm run dev
```

The dev server uses the same base path as GitHub Pages: [http://localhost:5173/silvermoon-legend/](http://localhost:5173/silvermoon-legend/).

To check the production build:

```bash
npm run build
npm run preview
```

## Update the game

The playable source is `src/game/SilverMoon.tsx`. It is the canvas file unchanged, including its `grok/canvas` imports. Vite and TypeScript resolve `grok/canvas` to `src/shims/grok-canvas.tsx`.

To take a newer canvas export:

1. Replace `src/game/SilverMoon.tsx` with the new file.
2. Leave the `grok/canvas` import lines as they are.
3. Run `npm run build`.

If the new file imports a name the shim does not export yet, add that name to `src/shims/grok-canvas.tsx`. React hooks and the `CSSProperties` / `ChangeEvent` types are re-exported from React. `useGrokTheme` and `Page` are the local implementations. Do not clear or rewrite `localStorage`, `sessionStorage`, IndexedDB, cookies, or `window.name` from the shims — the game owns those saves.

## GitHub Pages

`.github/workflows/deploy.yml` builds on every push to `main` and deploys the `dist/` folder with `actions/upload-pages-artifact` and `actions/deploy-pages`.

If a push does not publish the site, enable Actions as the Pages source: **Settings → Pages → Build and deployment → Source: GitHub Actions**. This repo does not add a `gh-pages` branch or a `docs/` folder.
