# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

John Town is a local development dashboard that automatically detects and displays all running dev servers on your machine. It scans common development ports (3000-3010, 4000-4010, 5173-5180, 8000-8010, etc.), identifies the framework, project name, and git branch for each server, and shows them as clickable cards. The list auto-refreshes every 5 seconds.

## Tech Stack

- **Runtime:** Deno
- **Framework:** Fresh 2.x (JSR `@fresh/core`)
- **UI library:** Preact (with `@preact/signals` for state)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Bundler:** Vite 7 (with `@fresh/plugin-vite`)
- **Platform:** macOS only (uses `lsof` for port scanning)

## Commands

- `deno task dev` — Start dev server on port 3333 with hot reload
- `deno task build` — Production build (outputs to `_fresh/`)
- `deno task start` — Serve the production build on port 3333
- `deno task check` — Run formatter check, linter, and type check
- `deno task update` — Update Fresh framework

## Architecture

### Server-side flow

`main.ts` creates the Fresh `App`, sets up middleware (static files, shared state, logging), and mounts file-system routes. The homepage route (`routes/index.tsx`) calls `scanPorts()` server-side for initial data, then hands off to the client.

### Port scanning (`lib/port-scanner.ts`)

The core feature. Uses macOS `lsof -iTCP -sTCP:LISTEN` to find all listening processes, filters to configured port ranges, excludes system processes (AirPlay, rapportd, etc.), then enriches each result with:
- Working directory via `lsof -p PID`
- Framework detection from command-line string matching
- Git branch and worktree status via `git` commands

Returns `DevServer[]` — the main data type shared across the app.

### Islands pattern (Fresh 2.x)

Fresh uses an "islands" architecture — components in `islands/` hydrate on the client for interactivity, everything else is server-rendered static HTML.

- `islands/ServerList.tsx` — The main interactive component. Receives initial server data as props, then polls `GET /api/servers` every 5 seconds to refresh.
- `components/ServerCard.tsx` — Pure server-rendered component (no client JS), displays a single server's info.

### API

- `GET /api/servers` — Returns `DevServer[]` JSON from the port scanner. Used by the ServerList island for auto-refresh.

### Shared state

`utils.ts` exports `define` (from `createDefine<State>()`) used by all routes/handlers for type-safe context. The `State` interface carries a `shared` string set in middleware.

## Import Aliases

- `@/` maps to the project root (e.g., `import { scanPorts } from "@/lib/port-scanner.ts"`)
- `fresh` maps to `@fresh/core`

## Lint Rules

Uses `fresh` and `recommended` Deno lint rule tags.
