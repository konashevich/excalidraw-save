# diagrams.free

**diagrams.free** — hand-drawn diagrams in your browser.

Live site: **[https://diagrams.free](https://diagrams.free)**

This repository ([konashevich/diagrams-free](https://github.com/konashevich/diagrams-free)) is a fork of [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT License). See [NOTICE](./NOTICE) for attribution.

**Why diagrams.free is different from Excalidraw**

Stock Excalidraw keeps one drawing in the browser. When you reset the canvas or start fresh, that slot is overwritten and the previous work is gone unless you exported it first. **diagrams.free** adds local **scene storage** so your diagrams stay on your device and are easy to find again:

- **Fully free (no subscription)** — use the app and scene storage without paying or signing up for a paid tier.
- **Scenes saved in the browser** — each diagram (including embedded images) is stored on your device in IndexedDB and local storage, not only in the single “current” slot.
- **Reset does not throw your work away** — **New canvas** and **Reset canvas** archive the current drawing into **My scenes**, then give you a clean canvas.
- **My scenes** — browse saved diagrams, open any of them, rename, duplicate, delete, or download as `.excalidraw` when you need them.
- **Several diagrams at once** — switch between ideas, versions, or projects without exporting every time or losing the last one.
- **Import into your library** — add `.excalidraw` files to **My scenes** without replacing what is on the canvas.
- **Private by default** — vault data stays on your machine; nothing is uploaded unless you export or share it yourself.

## diagrams-free (this fork)

This fork adds **local, browser-only multi-canvas storage** (“scene vault”) so reset/new does not permanently lose drawings.

### Hosting

Pushes to `master` deploy automatically via [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml). Details: [docs/github-pages-hosting.md](docs/github-pages-hosting.md).

Production builds use **diagrams.free** branding and disable official Excalidraw cloud backends (see `.env.production`). Drawings stay in your browser (IndexedDB / localStorage) unless you explicitly export them.

### Development

```bash
yarn install
yarn start
```

If `yarn install` fails with `ENOSPC` (full disk on `/tmp` or home), use a writable temp and cache directory:

```bash
mkdir -p /path/to/writable/tmp
TMPDIR=/path/to/writable/tmp YARN_CACHE_FOLDER=/path/to/writable/.yarn-cache yarn install
```

Open the URL printed by Vite (default port from `VITE_APP_PORT` in `.env.development`, often `3001`).

To work on the scene vault while it is being implemented, enable the flag in `.env.development.local` (not committed):

```bash
VITE_APP_SCENE_VAULT=true
```

When the flag is `false`, the app behaves like upstream Excalidraw.

### How scene vault storage works

When `VITE_APP_SCENE_VAULT=true`:

- The **active canvas** still autosaves to browser `localStorage` (same as upstream) for fast reload and tab sync.
- **My scenes** stores additional named snapshots in **IndexedDB** on your device only.
- **New canvas** archives the current drawing into the vault, then clears the editor.
- **My scenes** dialog: Open, Rename, Duplicate, Delete, Download, and **Import file** (adds `.excalidraw` to the vault without replacing the active canvas).
- Nothing is uploaded unless you explicitly export or use a sync feature you enable.

## Features

- 💯&nbsp;Free & open-source.
- 🎨&nbsp;Infinite, canvas-based whiteboard.
- ✍️&nbsp;Hand-drawn like style.
- 🌓&nbsp;Dark mode.
- 🏗️&nbsp;Customizable.
- 📷&nbsp;Image support.
- 😀&nbsp;Shape libraries support (community catalog on [libraries.excalidraw.com](https://libraries.excalidraw.com)).
- 🌐&nbsp;Localization (i18n) support.
- 🖼️&nbsp;Export to PNG, SVG & clipboard.
- 💾&nbsp;Open format — export drawings as an `.excalidraw` JSON file.
- ⚒️&nbsp;Wide range of tools — rectangle, circle, diamond, arrow, line, free-draw, eraser...
- ➡️&nbsp;Arrow-binding & labeled arrows.
- 🔙&nbsp;Undo / Redo.
- 🔍&nbsp;Zoom and panning support.

## Attribution

This project is a fork of [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT License). The editor library and `.excalidraw` file format come from that upstream codebase. See [NOTICE](./NOTICE) for copyright and third-party licenses.

diagrams.free is an independent deployment — not affiliated with [excalidraw.com](https://excalidraw.com) or Excalidraw+.

## Docs & feedback

- Branding and launch checklist: [docs/diagrams-free-branding-and-ip-clearance.md](docs/diagrams-free-branding-and-ip-clearance.md)
- Hosting: [docs/github-pages-hosting.md](docs/github-pages-hosting.md)
- Issues for **this fork**: [github.com/konashevich/diagrams-free](https://github.com/konashevich/diagrams-free)
- Support: [support@diagrams.free](mailto:support@diagrams.free)

Upstream Excalidraw development docs (for working on `packages/*`): [docs.excalidraw.com](https://docs.excalidraw.com/docs/introduction/development).
