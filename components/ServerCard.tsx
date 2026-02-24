/**
 * ServerCard Component — Table Row Layout
 *
 * Displays a running development server as a row in the "Town Registry" table.
 * Each server gets an animal character based on its framework.
 *
 * Desktop: 5-column CSS Grid row (Project, Process, Git, Claude, Actions)
 * Mobile: stacked 2-column layout with inline labels
 *
 * Click targets are separate: project name opens the server URL,
 * the Claude cell focuses the terminal, and the actions icon opens the URL.
 */

import type { DevServer } from "@/lib/port-scanner.ts";
import type { ClaudeSession } from "@/lib/claude-session.ts";
import { getCharacter } from "@/lib/characters.ts";

/** Shared column template used by both the header and each row */
export const TABLE_COLUMNS =
  "minmax(160px, 1.2fr) minmax(120px, 1fr) minmax(120px, 1.5fr) minmax(90px, auto) 48px";

interface ServerCardProps {
  server: DevServer;
  hostname?: string;
  onClaudeFocus?: (session: ClaudeSession) => void;
}

/** Small external-link SVG icon reused in a couple spots */
function ExternalLinkIcon({ class: className }: { class?: string }) {
  return (
    <svg
      class={`w-4 h-4 ${className ?? ""}`}
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
  );
}

/** Git status indicator — green dot for clean, yellow for dirty, dash for no git */
function GitStatus({ server }: { server: DevServer }) {
  if (!server.gitBranch) {
    return <span class="text-pebble">—</span>;
  }

  return (
    <div class="flex flex-col gap-0.5">
      <span class="truncate max-w-40 text-charcoal text-sm">
        {server.gitBranch}
      </span>
      {server.isWorktree && (
        <span class="text-warm-brown text-xs font-medium">worktree</span>
      )}
      <span class="flex items-center gap-1.5 text-xs">
        {server.gitDirty
          ? (
            <>
              <span class="w-1.5 h-1.5 rounded-full bg-sunshine border border-sunshine-dark shrink-0" />
              <span class="text-driftwood">Modified</span>
            </>
          )
          : (
            <>
              <span class="w-1.5 h-1.5 rounded-full bg-meadow shrink-0" />
              <span class="text-driftwood">Clean</span>
            </>
          )}
      </span>
    </div>
  );
}

/** Claude session indicator — sparkle + status label, or a dash */
function ClaudeStatus(
  { server, onClaudeFocus }: {
    server: DevServer;
    onClaudeFocus?: (session: ClaudeSession) => void;
  },
) {
  if (!server.claudeSession) {
    return <span class="text-pebble">—</span>;
  }

  const isWaiting = server.claudeSession.status === "waiting";

  return (
    <button
      type="button"
      onClick={() => onClaudeFocus?.(server.claudeSession!)}
      class="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80 text-left"
      title={isWaiting
        ? "Claude is waiting for input — click to focus"
        : "Claude is working — click to focus"}
    >
      <span
        class={`text-sm leading-none ${
          isWaiting ? "text-amber-500 animate-pulse" : "text-pebble"
        }`}
      >
        ✳
      </span>
      <span
        class={`text-xs ${
          isWaiting ? "text-amber-600 font-medium" : "text-driftwood"
        }`}
      >
        {isWaiting ? "Waiting" : "Working"}
      </span>
    </button>
  );
}

export function ServerCard(
  { server, hostname = "localhost", onClaudeFocus }: ServerCardProps,
) {
  const url = `http://${hostname}:${server.port}`;
  const character = getCharacter(server.framework);

  return (
    <div class="border-t border-pebble/30">
      {/* ── Desktop Row ── */}
      <div
        class="hidden md:grid items-start gap-x-4 px-4 py-3 border-l-3 border-transparent hover:border-meadow transition-colors"
        style={{ gridTemplateColumns: TABLE_COLUMNS }}
      >
        {/* Column 1: Project — two lines: identity then path */}
        <div class="flex flex-col gap-0.5 min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="text-xl leading-none"
              role="img"
              aria-label={character.label}
            >
              {character.emoji}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-heading font-semibold text-charcoal truncate hover:text-meadow transition-colors"
            >
              {server.projectName}
            </a>
            <span class="font-mono text-xs font-medium bg-sunshine text-charcoal px-1.5 py-0.5 rounded border border-sunshine-dark shrink-0">
              :{server.port}
            </span>
            <span class="text-xs text-driftwood shrink-0">
              {server.framework}
            </span>
          </div>
          {server.projectPath && (
            <span class="text-xs text-pebble truncate pl-7">
              {server.projectPath}
            </span>
          )}
        </div>

        {/* Column 2: Process — inline with dot dividers */}
        <div class="flex flex-wrap items-center gap-x-1 text-xs text-driftwood">
          {server.uptime && (
            <>
              <span>{server.uptime}</span>
              <span class="text-pebble">&middot;</span>
            </>
          )}
          {server.memoryMB !== undefined && (
            <>
              <span>{server.memoryMB} MB</span>
              <span class="text-pebble">&middot;</span>
            </>
          )}
          <span class="text-pebble font-mono">PID {server.pid}</span>
        </div>

        {/* Column 3: Git */}
        <GitStatus server={server} />

        {/* Column 4: Claude */}
        <ClaudeStatus server={server} onClaudeFocus={onClaudeFocus} />

        {/* Column 5: Actions */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center w-8 h-8 rounded hover:bg-sand transition-colors"
          title={`Open ${server.projectName} in browser`}
        >
          <ExternalLinkIcon class="text-pebble hover:text-meadow transition-colors" />
        </a>
      </div>

      {/* ── Mobile Row ── */}
      <div class="md:hidden px-4 py-3 border-l-3 border-transparent hover:border-meadow transition-colors">
        {/* Top line: emoji + name + port + open icon */}
        <div class="flex items-center gap-2">
          <span
            class="text-lg leading-none"
            role="img"
            aria-label={character.label}
          >
            {character.emoji}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-heading font-semibold text-charcoal truncate hover:text-meadow transition-colors"
          >
            {server.projectName}
          </a>
          <span class="font-mono text-xs font-medium bg-sunshine text-charcoal px-1.5 py-0.5 rounded border border-sunshine-dark shrink-0">
            :{server.port}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            class="ml-auto shrink-0"
            title={`Open ${server.projectName} in browser`}
          >
            <ExternalLinkIcon class="text-pebble" />
          </a>
        </div>

        {/* Framework + path */}
        <div class="text-xs text-driftwood mt-1 pl-7">
          {server.framework}
          {server.projectPath && (
            <>
              <span class="mx-1 text-pebble">&middot;</span>
              <span class="text-pebble">{server.projectPath}</span>
            </>
          )}
        </div>

        {/* Process info */}
        <div class="text-xs text-driftwood mt-1 pl-7">
          {server.uptime && <span>{server.uptime}</span>}
          {server.uptime && server.memoryMB !== undefined && (
            <span class="mx-1 text-pebble">&middot;</span>
          )}
          {server.memoryMB !== undefined && <span>{server.memoryMB} MB</span>}
          <span class="mx-1 text-pebble">&middot;</span>
          <span class="text-pebble font-mono">PID {server.pid}</span>
        </div>

        {/* Git + Claude on one line */}
        <div class="flex items-center gap-4 mt-1.5 pl-7 text-xs">
          {server.gitBranch
            ? (
              <span class="flex items-center gap-1.5">
                <span class="text-driftwood font-medium">Git:</span>
                <span class="text-charcoal truncate max-w-32">
                  {server.gitBranch}
                </span>
                {server.gitDirty
                  ? (
                    <span class="w-1.5 h-1.5 rounded-full bg-sunshine border border-sunshine-dark shrink-0" />
                  )
                  : 
                  <span class="w-1.5 h-1.5 rounded-full bg-meadow shrink-0" />}
              </span>
            )
            : null}

          {server.claudeSession
            ? (
              <ClaudeStatus
                server={server}
                onClaudeFocus={onClaudeFocus}
              />
            )
            : null}
        </div>
      </div>
    </div>
  );
}
