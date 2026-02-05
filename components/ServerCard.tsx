/**
 * ServerCard Component
 *
 * Displays a running development server as a "townsperson" card.
 * Each server gets an animal character based on its framework, making
 * the dashboard feel like a bustling little town.
 * Clicking the card opens the server in a new browser tab.
 */

import type { DevServer } from "@/lib/port-scanner.ts";
import { getCharacter } from "@/lib/characters.ts";

interface ServerCardProps {
  server: DevServer;
}

export function ServerCard({ server }: ServerCardProps) {
  const url = `http://${server.host}:${server.port}`;
  const character = getCharacter(server.framework);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="group block bg-sand border-2 border-pebble rounded-2xl p-5 transition-all duration-200 hover:border-meadow hover:-translate-y-0.5"
      style={{
        boxShadow:
          "0 4px 12px rgba(160, 113, 79, 0.1), 0 1px 3px rgba(160, 113, 79, 0.08)",
      }}
    >
      {/* Character and framework row */}
      <div class="flex items-center gap-3 mb-3">
        <span
          class="text-3xl leading-none"
          role="img"
          aria-label={character.label}
        >
          {character.emoji}
        </span>
        <div class="flex-1 min-w-0">
          <span class="text-xs font-semibold text-bark">
            {character.label}
          </span>
          <span class="block text-xs text-driftwood">
            {server.framework}
          </span>
        </div>
        <span class="font-mono text-sm font-medium bg-sunshine text-charcoal px-2.5 py-1 rounded-lg border border-sunshine-dark">
          :{server.port}
        </span>
      </div>

      {/* Project name */}
      <h3 class="text-lg font-heading font-semibold text-charcoal truncate group-hover:text-meadow transition-colors">
        {server.projectName}
      </h3>

      {/* Git branch */}
      {server.gitBranch && (
        <div class="flex items-center gap-1.5 mt-2 text-sm text-bark">
          <svg
            class="w-4 h-4 flex-shrink-0 text-driftwood"
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
          <span class="truncate">
            {server.isWorktree && (
              <span class="text-warm-brown font-medium mr-1">worktree:</span>
            )}
            {server.gitBranch}
          </span>
        </div>
      )}

      {/* Click hint */}
      <div class="mt-4 pt-3 border-t-2 border-dashed border-eggshell flex items-center justify-between text-xs text-driftwood">
        <span class="truncate">{server.host}:{server.port}</span>
        <svg
          class="w-4 h-4 group-hover:translate-x-1 transition-transform text-pebble"
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
    </a>
  );
}
