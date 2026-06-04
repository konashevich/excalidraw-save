# AGENTS.md

Guidance for AI agents working on **diagrams.free** — a fork of [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT). Live site: **[https://diagrams.free](https://diagrams.free)**. Repo: [konashevich/diagrams-free](https://github.com/konashevich/diagrams-free).

This is **not** the official Excalidraw product. The app has been fully rebranded to **diagrams.free** (see [docs/diagrams-free-branding-and-ip-clearance.md](docs/diagrams-free-branding-and-ip-clearance.md)): new logo/favicon/OG assets, **Indie Flower** (Google Font, OFL) as the default hand-drawn font, and removal of Excalidraw trademarks and official cloud backends from production builds.

---

## What makes this fork different

Stock Excalidraw keeps one implicit “current scene” in the browser; reset/new overwrites it. **diagrams.free** adds:

- **Scene vault** — local, browser-only multi-canvas storage (“My scenes”) in IndexedDB; reset/new **archives** instead of destroying work.
- **Private by default** — vault data stays on the device unless the user exports or uses sync/share they enable.
- **Fully free** — no subscription; no Excalidraw+ or official excalidraw.com backends in production.
- **Google Drive sync & share** (in progress, early stage) — planned backup/restore of the vault and share links via the user’s Drive; see plan below.
- **GitHub Pages hosting** on custom domain **diagrams.free** — static SPA, no app server. See [docs/github-pages-hosting.md](docs/github-pages-hosting.md).
- **Shape libraries** — browse/install still points at Excalidraw’s public catalog (`libraries.excalidraw.com`); personal libraries stay in the browser. A self-hosted or independent catalog may come later. See [docs/libraries-overview.md](docs/libraries-overview.md).

Full user-facing summary: [README.md](README.md).

---

## Project structure

The **product** is **diagrams.free**, but the **repo layout** still uses upstream Excalidraw folder and package names (`excalidraw-app/`, `@excalidraw/*`). That is intentional — easier to merge upstream fixes. Do not read those names as the public brand.

| Path | Role |
|------|------|
| `excalidraw-app/` | **Start here for fork work** — vault, Drive, branding, deploy, menus |
| `packages/excalidraw/` | Editor React library (npm: `@excalidraw/excalidraw`); shared with upstream |
| `packages/common`, `element`, `math`, `utils` | Low-level editor packages (`@excalidraw/*`) |
| `docs/` | Design plans, hosting, branding, OAuth |
| `examples/` | Upstream integration samples (usually not needed for diagrams.free) |

**Prefer `excalidraw-app/`** for diagrams.free features. Touch `packages/*` only for editor-core changes or when unavoidable.

---

## Scene vault (implemented)

**Flag:** `VITE_APP_SCENE_VAULT=true` (on in production and development).

**Design doc:** [docs/scene-vault-design.md](docs/scene-vault-design.md)

**Concept:**

- **Active canvas** — still autosaves via existing `LocalData` (`localStorage` + IndexedDB files store), same as upstream.
- **Vault** — separate IndexedDB database (`scene-vault-db`) holds named snapshots (elements, appState, embedded files).
- **New canvas / Reset canvas** — flush current scene into vault, then clear editor (no silent data loss).
- **My scenes** — Open, Rename, Duplicate, Delete, Download (`.excalidraw`), Import file into vault.
- **Flush before switch** — always `LocalData.flushSave()` before archive or load.
- **No backend** for vault; `.excalidraw` export remains compatible with stock Excalidraw.

Key code areas: `excalidraw-app/` vault service, vault UI dialog, `LocalData.ts`.

When the flag is `false`, behavior matches upstream Excalidraw.

---

## Google Drive sync & share (in progress)

**Flag:** `VITE_APP_GOOGLE_DRIVE` (currently `false` in production; Phase 1–2 in repo).

**Plan:** [docs/google-drive-sync-and-share-plan.md](docs/google-drive-sync-and-share-plan.md)  
**OAuth setup:** [docs/google-oauth-setup.md](docs/google-oauth-setup.md)

**Concept:**

| Feature | Idea |
|---------|------|
| **Sync** | Sign in with Google → backup/restore **My scenes** to `diagrams.free/vault/` on the user’s Drive. Local vault stays authoritative while editing; Drive is a replica (debounced auto-sync planned). |
| **Share** | Export scene → upload to `diagrams.free/shared/` → link like `https://diagrams.free/#share={driveFileId}`. Access controlled by Google Drive sharing only (plaintext `.excalidraw`, no app-level encryption). |
| **Hosting** | Static app on GitHub Pages; **Google Drive is the only cloud storage** — no scene blob server. |
| **Scope** | `drive.file` only; OAuth/API key restricted to `https://diagrams.free`. |

Replaces official share/collab (`json.excalidraw.com`, Firebase) which do not work on third-party origins.

Planned code layout: `excalidraw-app/google-drive/` (`auth`, `DriveSyncService`, `DriveShareService`, settings/share UI).

---

## Hosting & deployment

- **URL:** https://diagrams.free  
- **Deploy:** push to `master` → GitHub Actions → build → GitHub Pages ([`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml))  
- **Vite `base`:** `/` (custom apex domain)  
- **Production env:** `.env.production` — scene vault on, official Excalidraw backends empty, tracking off, diagrams.free branding  

Details: [docs/github-pages-hosting.md](docs/github-pages-hosting.md).

---

## Development workflow

1. **Fork features** — work in `excalidraw-app/` (vault, Drive, branding, menus).
2. **Editor core** — work in `packages/*` only when changing shared library behavior.
3. **Testing** — run `yarn test:update` before committing; `yarn test:typecheck` for TypeScript.
4. **Formatting** — `yarn fix` for lint/format.

### Commands

```bash
yarn install
yarn start                    # dev server (see VITE_APP_PORT in .env.development)
yarn test:typecheck
yarn test:update
yarn fix
yarn build:app:docker         # production build (CI uses this)
```

Optional local overrides in `.env.development.local` (not committed), e.g. `VITE_APP_SCENE_VAULT=true`, `VITE_APP_GOOGLE_DRIVE=true` with Google client ID.

If `yarn install` fails with `ENOSPC`, set `TMPDIR` and `YARN_CACHE_FOLDER` to a writable path (see [README.md](README.md)).

---

## Architecture notes

- **Yarn workspaces** monorepo; internal packages use path aliases (see `vitest.config.mts`).
- **Build:** esbuild for packages, Vite for the app.
- **TypeScript** throughout with strict configuration.
- **Attribution:** MIT upstream code retained with [NOTICE](./NOTICE); product identity is **diagrams.free**, not Excalidraw.

---

## Key documentation index

| Topic | Doc |
|-------|-----|
| Scene vault design | [docs/scene-vault-design.md](docs/scene-vault-design.md) |
| Google Drive sync/share plan | [docs/google-drive-sync-and-share-plan.md](docs/google-drive-sync-and-share-plan.md) |
| GitHub Pages / domain | [docs/github-pages-hosting.md](docs/github-pages-hosting.md) |
| Branding & IP clearance | [docs/diagrams-free-branding-and-ip-clearance.md](docs/diagrams-free-branding-and-ip-clearance.md) |
| Shape libraries | [docs/libraries-overview.md](docs/libraries-overview.md) |
| Upstream editor development | [docs.excalidraw.com](https://docs.excalidraw.com/docs/introduction/development) |

Support: [support@diagrams.free](mailto:support@diagrams.free). Issues: [github.com/konashevich/diagrams-free](https://github.com/konashevich/diagrams-free).
