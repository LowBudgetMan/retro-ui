# AGENTS.md

Guidance for AI coding agents working in this repository. Human contributors
should start with [CONTRIBUTING.md](CONTRIBUTING.md); everything there applies to
agents too.

## Project

Retro UI — a React + TypeScript + Vite web app for facilitating Agile
retrospectives. See the [README](README.md) for how to run the app and configure
environment variables.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server with hot reload (http://localhost:3000)
npm run test       # Vitest unit/component tests
npm run test:watch # Vitest in watch mode
npm run lint       # ESLint — fails on any warning (--max-warnings 0)
npm run build      # tsc typecheck + Vite production build
```

Always run `npm run test`, `npm run lint`, and `npm run build` before proposing a
change as complete — these three are what CI enforces.

## Conventions

- **TypeScript + React** throughout; prefer function components and hooks.
- **Linting is zero-tolerance.** `npm run lint` runs with `--max-warnings 0`, so
  any warning fails CI. Fix all warnings before finishing.
- **Tests are co-located** with the code they cover, using
  [Vitest](https://vitest.dev/) and
  [Testing Library](https://testing-library.com/). Add coverage for new behavior
  and bug fixes.
- Match the patterns already present in `src/` — follow the surrounding code's
  naming, structure, and formatting rather than introducing new styles.
- End-to-end tests live in a separate repository and run in CI; they don't need
  to be run locally for most changes.

## Contributing & PRs

Follow the full workflow in [CONTRIBUTING.md](CONTRIBUTING.md): branch off `main`,
keep changes focused, run the local checks above, and open a pull request against
`main`. The PR must pass the CI pipeline (test, lint, build, image build, and
E2E).
