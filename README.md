# John Town

A local development dashboard for macOS that automatically finds and displays
all the dev servers running on your machine. Start any project on a common dev
port and it shows up here — no configuration needed.

![Built with Fresh](https://fresh.deno.dev/fresh-badge-dark.svg)

## Features

- **Auto-detects dev servers** — Scans common development ports and displays
  every running server in a table, each with its own animal character based on
  the framework
- **Framework detection** — Identifies Vite, Next.js, Fresh, Django, Rails,
  Flask, Remix, Nuxt, Astro, Phoenix, and more
- **Git status at a glance** — Shows the current branch, clean/modified state,
  and worktree info
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code) integration**
  — Detects active Claude Code sessions and shows whether Claude is working or
  waiting for input. Click to focus the terminal
- **Live refresh** — Polls every 5 seconds so new servers appear and stopped
  ones disappear automatically
- **Click to open** — Click any project name to open it in a new browser tab
- **Configurable** — Customize port ranges, characters, poll interval, and
  excluded processes via the settings drawer or `~/.john-town/settings.json`

## Requirements

- **macOS** (uses `lsof` for port detection)
- **[Deno](https://docs.deno.com/runtime/getting_started/installation)**

## Getting Started

```sh
deno install
deno task dev
```

Open [http://localhost:3333](http://localhost:3333) to see your dashboard.

## Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `deno task dev`     | Start dev server with hot reload (port 3333) |
| `deno task build`   | Build for production                         |
| `deno task start`   | Serve the production build                   |
| `deno task compile` | Build a standalone binary                    |
| `deno task check`   | Run formatter, linter, and type checks       |

## Port Ranges

John Town scans these port ranges by default:

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

Port 5000 is skipped (used by macOS AirPlay Receiver). To customize port ranges,
open the settings drawer at the bottom of the dashboard or edit
`~/.john-town/settings.json`.

## Built With

[Deno](https://deno.com) · [Fresh 2.x](https://fresh.deno.dev) ·
[Preact](https://preactjs.com) · [Tailwind CSS v4](https://tailwindcss.com) ·
[Vite](https://vite.dev)
