# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dashboard** is the primary web frontend for the Devtron platform - a Kubernetes-native software delivery and operations platform. This is a React TypeScript single-page application (SPA) built with Vite that provides the complete user interface for managing Kubernetes clusters, applications, CI/CD pipelines, security, and infrastructure.

- **License**: Apache 2.0
- **Version**: 1.22.0
- **Base Path**: `/dashboard`
- **Package Manager**: Yarn 4.9.2
- **Private**: Yes (not published to npm)

## Commands

### Development
```bash
yarn start            # Start Vite dev server on port 3000
yarn build            # Production build with sourcemaps (8GB heap)
```

### Linting & Type Checking
```bash
yarn lint             # TypeScript check + ESLint (max-warnings: 0, strict)
yarn lint-fix         # Auto-fix ESLint issues
yarn tsc --noEmit        # Run TypeScript type check only
```

## Architecture

### Directory Structure

**Total Size**: 17MB | 1,217 TS/TSX files | 770 TSX files

```
src/
├── assets/                    # Static assets
│   ├── icons/                # SVG icons
│   ├── img/                  # PNG/JPG images
│   ├── logo/                 # Brand logos
│   ├── gif/                  # Animated GIFs
│   └── fonts/                # Custom fonts
│
├── components/               # 37 feature-based component directories
│   ├── common/              # Shared UI components
│   │   ├── Banner/
│   │   ├── DynamicTabs/
│   │   ├── List/
│   │   ├── navigation/      # Navigation & routing
│   │   ├── Select/
│   │   ├── SidePanel/
│   │   └── ...
│   ├── login/               # Login/SSO components
│   ├── app/                 # Application-related components
│   ├── ciPipeline/          # CI pipeline configuration
│   ├── cdPipeline/          # CD pipeline configuration
│   ├── ResourceBrowser/     # Kubernetes resource browser
│   ├── workflowEditor/      # Workflow/pipeline editor
│   ├── security/            # Security-related components
│   ├── ClusterNodes/        # Cluster node monitoring
│   ├── Jobs/                # Job management
│   ├── ApplicationGroup/    # App grouping
│   ├── bulkEdits/           # Bulk operations
│   ├── globalConfigurations/ # Global settings
│   ├── gitProvider/         # Git provider integration
│   ├── dockerRegistry/      # Docker registry config
│   ├── chartRepo/           # Helm chart repository
│   ├── externalArgoApps/    # External ArgoCD apps
│   ├── gitOps/              # GitOps configuration
│   ├── notifications/       # Notification system
│   ├── hyperion/            # Advanced features
│   ├── material/            # Material resource management
│   ├── v2/                  # V2 components (redesigned)
│   ├── __mocks__/           # Mock data for testing
│   └── util/                # Component utilities
│
├── Pages/                    # Legacy page-level components (v1)
│   ├── App/
│   ├── Applications/
│   ├── ChartStore/
│   ├── GlobalConfigurations/
│   ├── License/
│   ├── Releases/
│   └── Shared/
│
├── Pages-Devtron-2.0/        # Redesigned pages (v2, domain-driven)
│   ├── ApplicationManagement/
│   ├── Automation&Enablement/
│   ├── CostVisibility/
│   ├── GlobalConfiguration/
│   ├── GlobalOverview/
│   ├── InfrastructureManagement/
│   ├── SecurityCenter/
│   ├── SoftwareReleaseManagement/
│   └── Shared/
│
├── config/                   # Configuration files
│   ├── constants.ts         # API routes, constants (ROUTES object, API paths)
│   ├── constantMessaging.ts # User-facing messages
│   ├── routes.ts            # URL routes and path constants
│   └── utils.tsx            # Config utilities
│
├── services/                 # API services
│   ├── service.ts           # Main API calls (validateToken, cluster, app, CI/CD)
│   ├── fetchWithFullRoute.ts
│   └── service.types.ts     # Service type definitions
│
├── util/                     # Utilities
│   ├── Subject.ts           # Custom pub/sub implementation (NOT RxJS)
│   ├── MurmurHash3.ts       # Hash function
│   └── Util.ts              # Helper utilities
│
├── css/                      # Global styles
│   ├── application.scss     # Main stylesheet
│   ├── base.scss            # Base styles
│   ├── forms.scss           # Form styles
│   ├── themeTokens.scss     # Design tokens
│   ├── themeUtils.scss      # Theme utilities
│   ├── mixins.scss          # SCSS mixins
│   ├── formulae.scss        # Formulas/calculations
│   ├── iconTheming.scss     # Icon theming
│   └── whiteCard.scss       # Card component styles
│
├── index.tsx                 # App entry point (ReactDOM.render)
├── App.tsx                   # Root component (routing, auth, error handling)
├── vite-env.d.ts            # Vite type definitions
├── custom.d.ts              # Custom type definitions
└── setupTests.js            # Test setup
```

### Path Aliases

TypeScript path aliases are configured in [tsconfig.json](tsconfig.json):

```typescript
@Icons/*           → ./src/assets/icons/*
@Images/*          → ./src/assets/img/*
@Components/*      → ./src/components/*
@Config/*          → ./src/config/*
@Pages/*           → ./src/Pages/*
@PagesDevtron2.0/* → ./src/Pages-Devtron-2.0/*
@Services/*        → ./src/services/*
```

**Always use these aliases instead of relative paths** when importing across directories.

### Build Configuration

The application uses Vite with manual chunk splitting for optimal bundle loading ([vite.config.mts](vite.config.mts)):

**Manual Chunks:**
- `@moment` - moment, moment-timezone
- `@react-select` - react-select
- `@react-dates` - react-dates
- `@react-virtualized` - react-virtualized
- `@react-mde` - react-mde
- `@rjsf` - React JSON Schema Form
- `@code-editor` - CodeMirror
- `@rxjs` - rxjs
- `@sentry` - error tracking
- `@react-router` - routing
- `@devtron-common-*` - Chunks from devtron-fe-common-lib

**Key Plugins:**
- React plugin (JSX/TSX support)
- SVGR (SVG as React components)
- Vite PWA (service worker, caching strategies, offline support)
- Compression (Brotli)
- TsConfig paths resolver
- Node globals polyfill
- Custom react-virtualized WindowScroller fix
- Custom HTML transformation (moves scripts to body end)

**Dev Server Proxy:**
- `/orchestrator` → proxied to target URL
- `/proxy` → proxied to target URL
- `/grafana` → proxied to target URL
- **Default Target**: https://staging.devtron.info/

**Build Settings:**
- Node heap: 8GB for production builds
- Sourcemaps: Enabled by default (disable with build-light)
- Target: Modern browsers
- Asset inline limit: 0 (no inlining)

When adding new large dependencies, consider adding them to the manual chunks configuration to optimize bundle loading.

## Code Standards

### Routing & Navigation

- **Router**: React Router v5 (history-based, not v6)
- **Routes Configuration**: Defined in [src/config/routes.ts](src/config/routes.ts)
- **Navigation Component**: [src/components/common/navigation/NavigationRoutes.tsx](src/components/common/navigation/NavigationRoutes.tsx)
- **Lazy Loading**: Use React.lazy() and Suspense for route-based code splitting

```typescript
import { lazy, Suspense } from 'react'

const MyPage = lazy(() => import('@Pages/MyPage'))

// In routing
<Suspense fallback={<Progressing />}>
    <MyPage />
</Suspense>
```

### Component Patterns

- **Function components**: Use arrow functions for all components (enforced by ESLint)
  ```typescript
  // ✅ DO
  export const MyComponent = () => { ... }

  // ❌ DON'T
  export function MyComponent() { ... }
  ```

- **TypeScript**: Strict mode is disabled, but type safety is encouraged
- **Styling**: BEM naming convention, external SCSS files (no inline styles)

### State Management

1. **Local State**: React hooks (useState, useEffect, useReducer)
2. **Context API**:
   - ThemeProvider (from common-lib)
   - UserEmailProvider (from common-lib)
   - UseRegisterShortcutProvider (from common-lib)
   - Custom contexts for specific features
3. **Data Fetching**:
   - Custom `useAsync` hook (from common-lib) for simple async operations
   - React Query (`@tanstack/react-query`) for complex data management
   - Direct API calls via [src/services/service.ts](src/services/service.ts)
4. **Pub/Sub Pattern**: Custom Subject class in [src/util/Subject.ts](src/util/Subject.ts)
   - **IMPORTANT**: This is NOT RxJS, it's a lightweight custom implementation

### Import Order

ESLint enforces a specific import order (configured in [.eslintrc.js](.eslintrc.js)):

1. React and external packages (`react`, `@?\\w`)
2. Devtron packages (`@devtron-labs`)
3. Internal path aliases (`@Components/*`, `@Config/*`, `@Services/*`, etc.)
4. Side effect imports
5. Relative imports (`../`, `./`)
6. Style imports (`.css`, `.scss`)

The `simple-import-sort` plugin will auto-fix import order on save.

### Best Practices (from README)

- **Single state per page**: Keep state management minimal
- **Pure functions**: Components should be pure where possible
- **BEM naming**: CSS class naming convention
- **No inline styles**: Use external stylesheets
- **Reusable components**: Extract components early
- **Heavy lifting in child components**: Not in parent containers
- **Parsing and error handling in services**: Not in components
- **No conditional rendering in JSX**: Use helper functions instead
- **No CSS IDs**: Use classes instead
- **Flexbox over float**: Modern CSS layout

### Pre-commit Hooks

The pre-commit hook ([.husky/pre-commit](.husky/pre-commit)) enforces:

1. **TypeScript check**: `yarn tsc --noEmit` must pass (max-warnings: 0, strict)
2. **Lint-staged**: ESLint check on staged files only

## Common Tasks

### Adding a New Page

1. **Choose directory structure**:
   - `src/Pages/` for legacy pages
   - `src/Pages-Devtron-2.0/` for redesigned pages (preferred)

2. **Create page component**:
   ```typescript
   // src/Pages-Devtron-2.0/MyFeature/MyPage.tsx
   export const MyPage = () => {
       return <div>My Page Content</div>
   }
   ```

3. **Add route** in [src/config/routes.ts](src/config/routes.ts):
   ```typescript
   export const URLS = {
       MY_FEATURE: '/my-feature',
   }
   ```

4. **Register in router** (NavigationRoutes.tsx or App.tsx):
   ```typescript
   import { MyPage } from '@PagesDevtron2.0/MyFeature'

   <Route path={URLS.MY_FEATURE}>
       <MyPage />
   </Route>
   ```

### Adding a New Component

1. **Create component directory** under `src/components/`:
   ```
   MyFeature/
   ├── MyFeature.tsx
   ├── MyFeature.scss
   ├── service.ts
   ├── types.ts
   └── constants.ts
   ```

2. **Use common-lib components** where possible:
   ```typescript
   import {
       Button,
       Icon,
       Progressing,
       ErrorScreenManager,
   } from '@devtron-labs/devtron-fe-common-lib'
   ```

### API Service Pattern

All API calls should be in dedicated service files:

```typescript
// src/services/service.ts or component-specific service.ts
import { get, post, put, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { ROUTES } from '@Config/constants'

export const fetchApplications = () => {
    return get(ROUTES.APP_LIST)
}

export const updateApplication = (payload) => {
    return put(`${ROUTES.APP}/${payload.id}`, payload)
}
```

### Using React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchApplications } from '@Services/service'

// In component
const { data, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
})

const mutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
})
```

### Authentication & Token Handling

- **Token validation**: Called on app load via `validateToken()` in [src/services/service.ts](src/services/service.ts)
- **Token storage**: Cookie named `argocd.token`
- **SSO support**: `getSSOConfigList()` service call
- **K8S_CLIENT mode**: Conditional auth bypass for Kubernetes client mode
- **Error handling**: ErrorBoundary wraps routing, Sentry integration for production

### Environment Configuration

**Runtime config** via `window._env_` (customEnv interface from common-lib):

```typescript
// Access feature flags
if (window._env_.FEATURE_SOFTWARE_DISTRIBUTION_HUB_ENABLE) {
    // render SDH feature
}

// Access API endpoints
const orchestratorUrl = window._env_.ORCHESTRATOR_ROOT
```

**Global window config** (set in [index.tsx](index.tsx)):
```typescript
window.__BASE_URL__        // Default: /dashboard
window.__ORCHESTRATOR_ROOT__ // Default: orchestrator
window._env_               // Runtime environment config
```

### Analytics & Monitoring

**Error Tracking (Sentry)**:
```typescript
// Conditional in production
if (window._env_.SENTRY_ENABLED) {
    Sentry.init({
        dsn: window._env_.SENTRY_DSN,
        environment: window._env_.SENTRY_ENV,
    })
}
```

**Google Analytics (GA4)**:
```typescript
import ReactGA from 'react-ga4'

ReactGA.event({
    category: 'User',
    action: 'Clicked Button',
})
```

**Google Tag Manager (GTM)**:
```typescript
import TagManager from 'react-gtm-module'

TagManager.initialize({ gtmId: window._env_.GTM_ID })
```

### Working with Icons

```typescript
// SVG as React component (via SVGR)
import { ReactComponent as MyIcon } from '@Icons/my-icon.svg'

// Using Icon component from common-lib
import { Icon } from '@devtron-labs/devtron-fe-common-lib'

<Icon name="my-icon" />
```

### PWA & Service Workers

- **Config**: [vite.config.mts](vite.config.mts) (Vite PWA plugin)
- **Caching Strategies**: Network-first for API calls, cache-first for assets
- **Offline Support**: Service worker enabled in production builds
- **Manifest**: Auto-generated by Vite PWA plugin

## Key Dependencies

**UI Framework:**
- React 17.0.2 (not React 18)
- React DOM 17.0.2
- React Router DOM 5.3.4 (v5, not v6)

**Component Libraries:**
- @devtron-labs/devtron-fe-common-lib (1.22.8-beta-4) - Primary component library
- @devtron-labs/devtron-fe-lib - Secondary feature library
- react-select 5.8.0
- react-dates 21.8.0
- @rjsf/core 5.13.3 (React JSON Schema Forms)

**State & Data:**
- @tanstack/react-query - Data fetching and caching
- RxJS 7.5.4 (minimal usage)

**Date/Time:**
- dayjs 1.11.8 (preferred)
- moment 2.29.4 (legacy)

**Code Editor:**
- @uiw/react-codemirror (via common-lib)
- CodeMirror 6 extensions

**Terminal:**
- xterm 4.19.0 (cluster terminal emulation)

**Markdown:**
- marked (rendering)
- react-mde 11.5.0 (editor)
- dompurify (sanitization)

**Analytics & Monitoring:**
- @sentry/react 7.119.1
- react-ga4 1.4.1
- react-gtm-module 2.0.11

**Utilities:**
- yaml 2.4.1
- jsonpath-plus
- fast-json-patch
- dompurify

**Build Tools:**
- Vite 6.3.5
- TypeScript 5.5.4
- ESLint 8.57.1 + Prettier 3.1.2
- Sass

## Testing

**Framework**:
- Vitest (configured, see [vite.config.mts](vite.config.mts))
- @testing-library/react 12.1.4
- @testing-library/jest-dom 5.16.2
- Jest (legacy, available for coverage)

**Setup**: [setupTests.js](setupTests.js)

**CI**: GitHub Actions in `.github/workflows/ci.yml`

## Notable Architecture Decisions

1. **Vite over Webpack**: Faster dev server and build performance
2. **React 17.0.2**: Mature version (not React 18 yet)
3. **React Router v5**: Legacy routing (not v6)
4. **Custom Subject class**: Lightweight pub/sub without RxJS dependency
5. **Common library dependency**: Heavy reliance on `@devtron-labs/devtron-fe-common-lib` for UI primitives
6. **Dual page structure**: Legacy Pages (v1) and Pages-Devtron-2.0 (redesigned v2) coexist
7. **Service-layer abstraction**: All API calls in dedicated service files
8. **TypeScript without strict mode**: More flexible but less type-safe
9. **Feature flag-driven development**: Extensive use of `window._env_` for conditional features
10. **Manual chunk splitting**: Optimized bundle loading for large dependencies

## Relationship to Other Repositories

- **Depends on**:
  - `@devtron-labs/devtron-fe-common-lib` (core UI components)
  - `@devtron-labs/devtron-fe-lib` (domain-specific features)
- **Purpose**: Primary web application for Devtron platform
- **Type**: SPA (Single Page Application) - not a library
- **Deployment**: Serves as the frontend for Kubernetes-native CI/CD platform
