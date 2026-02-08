/**
 * ServerCard Component
 *
 * Displays a running development server as a "townsperson" card.
 * Each server gets an animal character based on its framework, making
 * the dashboard feel like a bustling little town.
 * Clicking the card opens the server in a new browser tab.
 *
 * Full-width layout with two rows:
 * - Top row: project name, port, character, and framework
 * - Bottom row: metadata (git branch, path, uptime, memory, pid)
 */

import type { DevServer } from "@/lib/port-scanner.ts";
import { getCharacter } from "@/lib/characters.ts";

interface ServerCardProps {
  server: DevServer;
  hostname?: string;
}

export function ServerCard(
  { server, hostname = "localhost" }: ServerCardProps,
) {
  const url = `http://${hostname}:${server.port}`;
  const character = getCharacter(server.framework);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="group block bg-sand border-2 border-pebble rounded-lg p-4 sm:p-5 transition-all duration-200 hover:border-meadow hover:-translate-y-0.5"
      style={{
        boxShadow:
          "0 4px 12px rgba(160, 113, 79, 0.1), 0 1px 3px rgba(160, 113, 79, 0.08)",
      }}
    >
      {/* Top row: identity */}
      <div class="flex items-center gap-3">
        {/* Character emoji */}
        <span
          class="text-2xl leading-none"
          role="img"
          aria-label={character.label}
        >
          {character.emoji}
        </span>

        {/* Project name — the most important thing */}
        <h3 class="text-xl font-heading font-semibold text-charcoal truncate group-hover:text-meadow transition-colors leading-tight">
          {server.projectName}
        </h3>

        {/* Port badge */}
        <span class="font-mono text-xs font-medium bg-sunshine text-charcoal px-2 py-0.5 rounded-md border border-sunshine-dark shrink-0">
          :{server.port}
        </span>

        {/* Framework + character label */}
        <span class="hidden sm:inline text-xs text-driftwood shrink-0">
          {character.label}
          <span class="mx-1 text-pebble">&middot;</span>
          {server.framework}
        </span>

        {/* Git dirty indicator — a small dot that signals uncommitted changes */}
        {server.gitDirty && (
          <span
            class="w-2 h-2 rounded-full bg-sunshine border border-sunshine-dark shrink-0"
            title="Uncommitted changes"
          />
        )}

        {/* Spacer + external link icon pushed to the right */}
        <svg
          class="w-4 h-4 ml-auto shrink-0 text-pebble group-hover:text-meadow group-hover:translate-x-0.5 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>

      {/* Bottom row: metadata */}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-bark">
        {/* Git branch */}
        {server.gitBranch && (
          <span class="flex items-center gap-1">
            <svg
              class="w-3.5 h-3.5 text-pebble"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span class="truncate max-w-48">
              {server.isWorktree && (
                <span class="text-warm-brown font-medium mr-1">worktree:</span>
              )}
              {server.gitBranch}
            </span>
            {server.gitDirty && <span class="text-driftwood">(modified)</span>}
          </span>
        )}

        {/* Project path */}
        {server.projectPath && (
          <span class="hidden md:flex items-center gap-1 text-driftwood truncate max-w-64">
            <svg
              class="w-3.5 h-3.5 text-pebble shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span class="truncate">{server.projectPath}</span>
          </span>
        )}

        {/* Uptime */}
        {server.uptime && (
          <span class="flex items-center gap-1 text-driftwood">
            <svg
              class="w-3.5 h-3.5 text-pebble"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {server.uptime}
          </span>
        )}

        {/* Memory usage */}
        {server.memoryMB !== undefined && (
          <span class="flex items-center gap-1 text-driftwood">
            <svg
              class="w-3.5 h-3.5 text-pebble"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {server.memoryMB} MB
          </span>
        )}

        {/* PID */}
        <span class="text-pebble font-mono">
          PID {server.pid}
        </span>
      </div>
    </a>
  );
}
