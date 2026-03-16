# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn install          # Install dependencies (uses yarn v4)
yarn start            # Dev server at http://localhost:3000
yarn build            # Production build (8 GB node heap)
yarn build-light      # Production build without source maps
yarn lint             # TypeScript check + ESLint (zero warnings allowed)
yarn lint-fix         # Auto-fix ESLint issues
yarn test             # Run tests with vitest
yarn test-coverage    # Run tests with coverage report
```

To run a single test file:
```bash
yarn test path/to/file.test.tsx
```

The dev server proxies `/orchestrator` to the `TARGET_URL` in `vite.config.mts` (defaults to `https://devtron-ent-7.devtron.info/`). To point at a different backend, set `VITE_TARGET_URL` in a `.env.secrets` file.

Husky runs TypeScript compilation and lint-staged before every commit. Failing either blocks the commit.

## Architecture

### Entry & Routing

- **`src/index.tsx`** — bootstraps the app. Initializes Sentry, sets `window._env_` defaults (runtime config), wraps everything in `QueryClientProvider`, `ThemeProvider`, `UserEmailProvider`, and `RouterProvider`.
- **`src/App.tsx`** — validates the auth token, then renders `NavigationRoutes` (lazy) or redirects to login.
- **`src/components/common/navigation/NavigationRoutes.tsx`** — the main shell. Fetches server mode, user preferences, environment data, and server info on mount. Provides `MainContextProvider` with global state. Renders the `Navigation` sidebar and the route tree.
- **`src/components/common/navigation/NavRoutes.components.tsx`** — defines sub-routers for Devtron apps, jobs, external apps, etc.

### Two-tier page organization

The codebase has a legacy and a new page structure running side by side:

- **`src/components/`** — legacy component tree (apps, CI/CD pipelines, cluster nodes, global config, resource browser, etc.)
- **`src/Pages/`** — newer page modules: `App`, `Applications`, `ChartStore`, `GlobalConfigurations`, `Releases`, `Shared`
- **`src/Pages-Devtron-2.0/`** — Devtron 2.0 domain routers: `ApplicationManagement`, `Automation&Enablement`, `InfrastructureManagement`, `SecurityCenter`, `Shared`

New features should go in `src/Pages/` or `src/Pages-Devtron-2.0/`.

### TypeScript path aliases

Defined in `tsconfig.json`:

| Alias | Path |
|---|---|
| `@Icons/*` | `src/assets/icons/*` |
| `@Images/*` | `src/assets/img/*` |
| `@Components/*` | `src/components/*` |
| `@Config/*` | `src/config/*` |
| `@Pages/*` | `src/Pages/*` |
| `@PagesDevtron2.0/*` | `src/Pages-Devtron-2.0/*` |
| `@Services/*` | `src/services/*` |

### Shared libraries

Two npm packages supply the majority of shared UI/logic:

- **`@devtron-labs/devtron-fe-common-lib`** — OSS shared components, hooks, utilities, route constants (`ROUTER_URLS`, `BASE_ROUTES`), API helpers (`get`, `post`, `trash`), and context providers. Import from this package directly.
- **`@devtron-labs/devtron-fe-lib`** (optional enterprise library, loaded via `node_modules` if present) — enterprise-only components. **Never import directly.** Always use `importComponentFromFELibrary` from `src/components/common/helpers/Helpers.tsx`.

### `importComponentFromFELibrary` pattern

Enterprise features are feature-flagged at the import level:

```ts
const LicenseInfoDialog = importComponentFromFELibrary('LicenseInfoDialog', null, 'function')
// Then guard usage:
if (LicenseInfoDialog) { ... }
```

This returns `null` when the enterprise lib is absent, keeping OSS builds working.

### Server modes

`SERVER_MODE.FULL` — full Devtron install with CI/CD module.
`SERVER_MODE.EA_ONLY` — external apps only (no CI/CD).
`window._env_.K8S_CLIENT` — pure Kubernetes client mode (no auth, no CI/CD).

Routes and UI sections are conditionally rendered based on server mode.

### Runtime configuration

`window._env_` holds all runtime feature flags and config (set by the backend at serve time). Defaults are declared at the bottom of `src/index.tsx`. See `config.md` for the full list of supported keys.

### Service layer

- **`src/services/service.ts`** — global API calls (auth, app list, cluster list, login tracking).
- Component-level services live alongside their component (e.g., `src/components/app/service.ts`).
- All HTTP calls use `get`/`post`/`trash` from `devtron-fe-common-lib`, which wrap fetch and normalize errors.

### State management

- **`MainContextProvider`** (from `devtron-fe-common-lib`) — global context with `serverMode`, `isSuperAdmin`, `installedModuleMap`, feature flags, and more. Access via `useMainContext()`.
- Local component state is preferred; lift state only when needed.
- One stateful "page" component per view; child components should be pure/presentational.

### CSS conventions

- SCSS modules for component styles; global styles in `src/css/`.
- BEM naming for CSS classes.
- No IDs for CSS; no `float`; use flexbox.

### Build chunking

`vite.config.mts` manually splits vendor chunks: `@moment`, `@react-select`, `@react-virtualized`, `@rjsf`, `@react-mde`, `@code-editor`, `@rxjs`, `@sentry`, `@react-router`, and granular chunks per `devtron-fe-common-lib` dist file.
