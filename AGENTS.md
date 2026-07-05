# AGENTS.md

Guidance for AI coding agents working in this repository. Read
[CONTRIBUTING.md](CONTRIBUTING.md) first — it covers setup, commands, testing,
code style, and the pull request process, and all of it applies to agents. This
file only adds what isn't obvious from the code or covered there.

Retro UI is a React + TypeScript + Vite app for facilitating Agile retrospectives.
See the [README](README.md) for how to run it.

## Before finishing

Run `npm run test`, `npm run lint`, and `npm run build` — these three are what CI
enforces (lint fails on any warning). See `package.json` for the full script list.

## Non-obvious conventions

- Use **Luxon** `DateTime` for dates/times, never the native `Date`.

## Architecture

- **Data flow is unidirectional.** User actions call the REST API (via the
  services in `src/services/`) to mutate state — they do **not** set local
  state directly. The change comes back over a STOMP WebSocket as a CRUD event,
  and that event is what updates the UI. Optimistically updating local state
  after a mutation will double-apply or desync; let the socket drive it.
- **Contexts own state and the real-time stream.** `RetroContext` and
  `ActionItemsContext` hold the current state and set up their own
  `WebsocketService` subscriptions, mapping backend CRUD events to state
  updates and re-fetching over REST on reconnect. Put real-time behavior inside
  the relevant context, not in components.
- **All HTTP goes through `fetchClient`** (`src/config/FetchClient.ts`), a thin
  wrapper over `fetch` that attaches the auth Bearer token and share token and
  redirects to sign-in on 401. Don't call `fetch` or set auth headers by hand.
- **Page data is loaded by React Router loaders** (see `src/App.tsx`), not
  fetched in components on mount. Add a loader for new routes that need data.
