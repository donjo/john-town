# John Town

A local development dashboard for macOS that automatically finds and displays
all the dev servers running on your machine. Start any project on a common dev
port and it shows up here — no configuration needed.

![Built with Fresh](https://fresh.deno.dev/fresh-badge-dark.svg)

## What It Does

- **Auto-detects dev servers** — Scans common development ports and displays
  every running server in a table, each with its own animal character based on
  the framework
- **Framework detection** — Identifies Vite, Next.js, Fresh, Django, Rails,
  Flask, Remix, Nuxt, Astro, Phoenix, and more from the running process
- **Git status at a glance** — Shows the current branch, whether the working
  tree is clean or modified, and if the server is running from a git worktree
- **Claude Code integration** — Detects active
  [Claude Code](https://docs.anthropic.com/en/docs/claude-code) sessions in each
  project and shows whether Claude is working or waiting for input. Click the
  status to jump straight to that terminal tab (iTerm2 supported)
- **Live refresh** — The dashboard polls every 5 seconds, so new servers appear
  and stopped ones disappear without reloading the page
- **Click to open** — Click any project name to open that server in a new
  browser tab

## How It Works

### Port Scanning

John Town uses the macOS `lsof` command to find all processes listening on TCP
ports within configured ranges. It filters out system processes (AirPlay,
rapportd, etc.) and enriches each result with the project's working directory,
framework, git info, uptime, and memory usage.

**Default port ranges:**

| Ports     | Typical Use         |
| --------- | ------------------- |
| 3000–3010 | React, Remix, Rails |
| 3100–3110 | Backend APIs        |
| 4000–4010 | Phoenix, GraphQL    |
| 5001–5010 | Flask               |
| 5173–5180 | Vite                |
| 5800–5810 | Custom dev servers  |
| 8000–8010 | Fresh, Django       |
| 8080–8090 | General purpose     |
| 8888–8895 | Jupyter             |

Port 5000 is intentionally skipped because macOS uses it for AirPlay Receiver.

To add more ports, edit the `DEFAULT_PORT_RANGES` array in
`lib/port-scanner.ts`.

### Claude Code Detection

If you use Claude Code, the dashboard can show its status next to each project.
It works by:

1. Finding running `claude` processes with `pgrep`
2. Reading each process's environment variables to determine which project
   directory it's running in
3. Checking the Claude session JSONL file's modification time to figure out the
   current status

The status logic is timestamp-based:

- **Modified < 15 seconds ago** → **Working** — Claude is actively streaming a
  response or running tools
- **Modified 15 seconds – 5 minutes ago** → **Waiting** — Claude finished and is
  waiting for your input
- **Modified > 5 minutes ago** → not shown — the session is considered stale

Clicking a Claude status indicator focuses the terminal where that session is
running. For iTerm2 users, it jumps directly to the correct tab using
AppleScript. For other terminals, it brings the app to the foreground.

## Requirements

- **macOS** (uses `lsof` for port detection)
- **Deno** —
  [Install Deno](https://docs.deno.com/runtime/getting_started/installation)

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

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `deno task dev`   | Start dev server with hot reload (port 3333) |
| `deno task build` | Build for production                         |
| `deno task start` | Serve the production build                   |
| `deno task check` | Run formatter, linter, and type checks       |

## Built With

- [Deno](https://deno.com) — Runtime
- [Fresh 2.x](https://fresh.deno.dev) — Web framework
- [Preact](https://preactjs.com) — UI library
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [Vite](https://vite.dev) — Bundler
