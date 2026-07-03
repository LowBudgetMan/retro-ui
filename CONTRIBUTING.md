# Contributing to Retro UI

Thanks for your interest in contributing! This document describes how to set up
your environment, the conventions we follow, and what to expect when you open a
pull request.

## Prerequisites

- Node.js 22 (CI runs on Node 22; the README lists 18+ as a minimum, but match
  CI when in doubt)
- npm
- Docker (optional, only needed for containerized/E2E testing)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server with hot reloading (http://localhost:3000)
npm run dev
```

The dev server defaults the API URL to `http://localhost:8080` via `.env.local`.
See the [README](README.md) for other ways to run the app (static preview,
Docker) and for environment-variable details.

## Development Workflow

1. Create a branch off `main` for your change.
2. Make your change, keeping commits focused.
3. Run the full local check suite (see below) before pushing.
4. Open a pull request against `main`.

### Local checks

Run these before opening a PR — they mirror what CI enforces:

```bash
npm run test    # Vitest unit/component tests
npm run lint    # ESLint (fails on any warning: --max-warnings 0)
npm run build   # tsc typecheck + Vite production build
```

Useful during development:

```bash
npm run test:watch   # Re-run tests on change
npm run preview      # Serve the production build locally
```

## Testing

- Tests use [Vitest](https://vitest.dev/) with
  [Testing Library](https://testing-library.com/) (`@testing-library/react`,
  `@testing-library/user-event`, `@testing-library/jest-dom`).
- Co-locate tests with the code they cover and add coverage for new behavior or
  bug fixes.
- End-to-end tests live in a separate repository
  (`LowBudgetMan/retro-tests`) and run automatically in CI against the built
  image — you don't need to run them locally for most changes.

## Code Style

- **TypeScript + React** throughout. Prefer function components and hooks.
- **Linting is enforced with zero tolerance for warnings.** The `lint` script
  runs with `--max-warnings 0`, so CI fails on any warning. Run `npm run lint`
  and fix everything before pushing.
- Follow the patterns already present in `src/` — match the surrounding code's
  naming, structure, and formatting.

## Commit Messages

Write clear, imperative-mood subject lines that describe the change, e.g.:

```
Prevent duplicate websocket events during initial subscriptions
Add toast context
Fix mobile action items display
```

Conventional-commit prefixes (`feat:`, `refactor:`) appear in the history and
are welcome but not required. When a change lands via a pull request, the merge
commit typically includes the PR number (e.g. `Theme toggle change (#31)`).

## Pull Requests

- Target the `main` branch.
- Keep PRs focused on a single logical change where possible.
- Make sure the CI pipeline passes. On every PR, CI runs:
  - **test** — `npm run test`
  - **lint** — `npm run lint`
  - **build** — production build + server compile
  - **build-image** — builds and pushes a `beta-<sha>` Docker image
  - **e2e** — runs the end-to-end suite against your built image
- Beta images built for a PR are cleaned up automatically when the PR is merged.
- Describe what changed and why in the PR description, and link any related
  issues.

## Questions

If something here is unclear or you're unsure how to approach a change, open an
issue or start a draft PR to discuss.
