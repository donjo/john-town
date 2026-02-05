/**
 * ServerCard Component
 *
 * Displays information about a single running development server.
 * Shows the project name, git branch (if available), port, and framework.
 * Clicking the card opens the server in a new browser tab.
 */

import type { DevServer } from "@/lib/port-scanner.ts";

interface ServerCardProps {
  server: DevServer;
}

export function ServerCard({ server }: ServerCardProps) {
  const url = `http://${server.host}:${server.port}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
    >
      {/* Top row: Port badge and framework */}
      <div class="flex items-center justify-between mb-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-sm font-medium">
          :{server.port}
        </span>
        <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {server.framework}
        </span>
      </div>

      {/* Project name */}
      <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
        {server.projectName}
      </h3>

      {/* Git branch */}
      {server.gitBranch && (
        <div class="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
          <svg
            class="w-4 h-4 flex-shrink-0"
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
              <span class="text-purple-600 font-medium mr-1">worktree:</span>
            )}
            {server.gitBranch}
          </span>
        </div>
      )}

      {/* Click hint */}
      <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span class="truncate">{server.host}:{server.port}</span>
        <svg
          class="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
