# Devtron Dashboard - Copilot Coding Agent Instructions

## Project Overview

Devtron Dashboard is the React frontend for [Devtron](https://github.com/devtron-labs/devtron), a Kubernetes application management platform. This web application enables users to build, test, secure, deploy, and manage applications on Kubernetes through an intuitive interface.

## Technology Stack & Architecture

- **Frontend Framework**: React 17.0.2 with TypeScript
- **Build Tool**: Vite 6.3.5 with custom configuration
- **Package Manager**: Yarn 4.9.2 (always use `yarn`, never `npm`)
- **Node.js Version**: v22 (specified in `.nvmrc`)
- **Routing**: React Router v5
- **State Management**: React hooks and context
- **UI Libraries**: Custom components + @devtron-labs/devtron-fe-common-lib
- **Code Quality**: ESLint (Airbnb config) + Prettier + TypeScript strict mode
- **Testing**: Vitest for unit tests (32 test files currently)

## Build Commands & Validation Steps

### Essential Pre-requisites
**ALWAYS run `yarn install --immutable` before any other commands** (takes ~49 seconds). Never use `npm` - this project requires Yarn 4.9.2.

### Core Commands (in order of importance)
1. **Install dependencies**: `yarn install --immutable` (49s) - Required before any other command
2. **Type checking**: `yarn tsc --noEmit` (included in lint) - Validates TypeScript compilation
3. **Lint**: `yarn lint` (2-3s) - ESLint + TypeScript compilation check, max-warnings 0
4. **Start dev server**: `yarn start` - Launches on http://localhost:3000 with Vite HMR
5. **Build**: `yarn build` (56s) - Production build, uses 8GB memory allocation
6. **Lint fix**: `yarn lint-fix` - Auto-fixes ESLint issues

### Environment Setup
- Node.js v22 specified in `.nvmrc` (current environment may vary)
- Yarn 4.9.2 managed via corepack (`corepack enable yarn`)
- Backend defaults to https://preview.devtron.ai (configurable in `vite.config.mts`)

### Build Timing & Memory Requirements
- **Install**: ~49 seconds with dependency resolution
- **Build**: ~56 seconds with memory allocation of 8GB (`NODE_OPTIONS=--max_old_space_size=8192`)
- **Lint**: 2-3 seconds (fastest validation)
- **TypeScript check**: ~5 seconds

### Build Variants
- `yarn build` - Standard production build with source maps
- `yarn build-light` - Production build without source maps
- `yarn build-k8s-app` - Kubernetes client build variant

### Pre-commit Validation (Automated via Husky)
1. `yarn tsc --noEmit` - TypeScript compilation check
2. `yarn lint-staged` - ESLint on staged files only

## Project Structure & Key Locations

### Root Configuration Files
- `vite.config.mts` - Build configuration, proxy settings, chunk optimization
- `tsconfig.json` - TypeScript config with path aliases
- `.eslintrc.js` - ESLint configuration (Airbnb + TypeScript)
- `.prettierrc.js` - Code formatting rules
- `package.json` - Dependencies and scripts
- `.env*` files - Environment configuration (development, production, k8s variants)

### Source Code Organization (`src/`)
```
src/
├── Pages/                    # Main application pages/routes
│   ├── Applications/         # App management interfaces
│   ├── GlobalConfigurations/ # System configuration pages
│   ├── ChartStore/          # Helm chart management
│   └── Shared/              # Shared page components
├── components/              # Reusable UI components
│   ├── app/                 # App-specific components
│   ├── ciPipeline/          # CI pipeline components
│   ├── cdPipeline/          # CD pipeline components
│   └── common/              # Generic reusable components
├── services/                # API service layer
├── config/                  # Configuration constants and utilities
├── assets/                  # Images, icons, styles
└── css/                     # Global stylesheets
```

### TypeScript Path Aliases (use these for cleaner imports)
- `@Icons/*` → `./src/assets/icons/*`
- `@Images/*` → `./src/assets/img/*`
- `@Components/*` → `./src/components/*`
- `@Config/*` → `./src/config/*`
- `@Pages/*` → `./src/Pages/*`
- `@Services/*` → `./src/services/*`

## Continuous Integration & Quality Gates

### GitHub Workflows (`.github/workflows/`)
- **`ci.yml`**: Main CI pipeline, runs on PRs (non-draft), executes `yarn lint`
- **`pr-issue-validator.yaml`**: PR validation rules
- **`sentry-source-map-upload.yaml`**: Error tracking integration

### Pre-commit Hooks (`.husky/pre-commit`)
- TypeScript compilation check (`yarn tsc --noEmit`)
- Lint staged files (`yarn lint-staged`)
- **IMPORTANT**: Commits will fail if either step fails

### Code Quality Standards
- **ESLint**: Airbnb configuration with TypeScript rules, 0 warnings allowed
- **Prettier**: 120 character line width, single quotes, no semicolons
- **TypeScript**: Strict mode disabled but explicit typing encouraged
- **CSS**: BEM methodology for class naming

## Known Issues & Workarounds

### Build Warnings (Expected)
- Large chunks warning (>500KB) - Expected due to complex UI components
- Peer dependency warnings - Can be ignored, resolved via resolutions
- Browserslist data outdated - Run `npx update-browserslist-db@latest` if needed

### Memory Requirements
- Build process requires 8GB memory allocation (configured via NODE_OPTIONS)
- Use `yarn build-light` for faster builds without source maps in development

### Environment Configuration
- Backend defaults to `https://preview.devtron.ai`
- Modify `TARGET_URL` in `vite.config.mts` to change backend endpoint
- Environment variables are processed through custom `env.sh` script

## Development Best Practices

### Code Organization Rules
- **One state per page**: Keep state management minimal and localized
- **Single responsibility**: Methods should do one thing only
- **Self-documenting code**: Use clear variable/function names instead of comments
- **Component reusability**: Make smaller components reusable
- **Error handling**: Handle parsing and errors in service layer, not components

### CSS Guidelines
- Use BEM methodology for class naming
- Use flexbox/grid, avoid floats
- No CSS IDs - use classes only
- Avoid unnecessary indentation

### Import Organization (ESLint enforced)
1. React and external packages
2. @devtron-labs packages
3. Internal aliases (@Components, @Pages, etc.)
4. Relative imports
5. Style imports (CSS/SCSS)

## Testing & Validation

### Test Commands
- `yarn test` - Run unit tests with Vitest
- Tests located in `__tests__/` directories or `.test.tsx` files
- 32 test files currently in codebase

### Manual Validation Steps
1. **Build validation**: `yarn build` completes without errors (56s)
2. **TypeScript validation**: `yarn tsc --noEmit` passes (5s)  
3. **Code quality**: `yarn lint` passes with 0 warnings (3s)
4. **Dev server**: `yarn start` launches successfully on http://localhost:3000
5. **Basic functionality**: Navigate to different pages, check browser console for errors
6. **Responsive design**: Test on different screen sizes if UI changes made

## Troubleshooting Common Issues

### Build Failures
- **Memory issues**: Increase NODE_OPTIONS memory allocation (already set to 8GB)
- **TypeScript errors**: Run `yarn tsc --noEmit` to identify compilation issues
- **Dependency issues**: Clear node_modules and run `yarn install --immutable`
- **Yarn version conflicts**: Ensure using Yarn 4.9.2 via `yarn --version`

### Development Server Issues
- **Port conflicts**: Vite uses port 3000 by default, configurable in vite.config.mts
- **Proxy errors**: Backend URL configured in vite.config.mts (TARGET_URL)
- **Hot reload issues**: Restart dev server with `yarn start`

### Linting Failures
- **Auto-fix**: Run `yarn lint-fix` for fixable issues
- **Import order**: ESLint enforces specific import grouping (React, external, internal, relative, styles)
- **TypeScript errors**: Address compilation errors first before fixing linting

### Common Error Messages
- "command not found: vitest" - Tests use Vitest, run with `yarn test`
- Large chunk warnings during build - Expected behavior, can be ignored
- Peer dependency warnings during install - Expected, resolved via package.json resolutions

## Performance Considerations

- **Bundle optimization**: Manual chunk splitting configured for optimal loading
- **Caching**: Service worker enabled for static asset caching  
- **Compression**: Brotli compression enabled for smaller bundle sizes
- **Source maps**: Included by default (`yarn build-light` excludes them for faster builds)
- **Memory usage**: Build requires 8GB allocation due to large codebase (~2500 files)
- **Development**: HMR (Hot Module Replacement) enabled for fast development cycles

## Repository Statistics
- **Codebase size**: ~2,476 files, primarily TypeScript/TSX
- **Test coverage**: 32 test files using Vitest framework
- **Dependencies**: 45 production, 50+ development dependencies
- **License**: Apache 2.0

---

**Trust these instructions**: Only search for additional information if these instructions are incomplete or found to be incorrect. The build process, commands, and project structure documented here are verified and current.