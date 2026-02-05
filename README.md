# John Town

A local development dashboard that automatically finds and displays all the dev servers running on your machine. Start any project on a common dev port and it shows up here — no configuration needed.

![Built with Fresh](https://fresh.deno.dev/fresh-badge-dark.svg)

## What It Does

- Scans common development ports (3000–3010, 4000–4010, 5173–5180, 8000–8010, and more)
- Detects the framework each server is using (Vite, Next.js, Fresh, Django, Rails, etc.)
- Shows the project name, git branch, and worktree status for each server
- Auto-refreshes every 5 seconds so new servers appear without reloading the page
- Click any server card to open it in a new tab

## Requirements

- **macOS** (uses `lsof` for port detection)
- **Deno** — [Install Deno](https://docs.deno.com/runtime/getting_started/installation)

## Getting Started

Install dependencies:

```
deno install
```

Start the dev server:

```
deno task dev
```

Then open [http://localhost:3333](http://localhost:3333) to see your dashboard.

## Commands

| Command | Description |
|---|---|
| `deno task dev` | Start dev server with hot reload (port 3333) |
| `deno task build` | Build for production |
| `deno task start` | Serve the production build |
| `deno task check` | Run formatter, linter, and type checks |

## Built With

- [Deno](https://deno.com) — Runtime
- [Fresh 2.x](https://fresh.deno.dev) — Web framework
- [Preact](https://preactjs.com) — UI library
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [Vite](https://vite.dev) — Bundler
