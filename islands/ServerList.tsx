/**
 * ServerList Island — Town Registry Table
 *
 * An interactive island component that displays running servers in a
 * ledger-style table and auto-refreshes every 5 seconds to detect
 * new or stopped servers. Includes a nav bar with refresh status.
 *
 * Desktop: table with header row and 4-column grid rows
 * Mobile: header hidden, rows collapse into stacked layout
 */

import { useCallback, useEffect, useState } from "preact/hooks";
import { ServerCard, TABLE_COLUMNS } from "@/components/ServerCard.tsx";
import type { DevServer } from "@/lib/port-scanner.ts";
import type { ClaudeSession } from "@/lib/claude-session.ts";
import {
  type Character,
  DEFAULT_CHARACTER,
  type Settings,
} from "@/lib/settings.ts";

interface ServerListProps {
  initialServers: DevServer[];
}

export default function ServerList({ initialServers }: ServerListProps) {
  const [servers, setServers] = useState<DevServer[]>(initialServers);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClaudeFocus = useCallback((session: ClaudeSession) => {
    fetch("/api/focus-claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid: session.pid,
        termProgram: session.termProgram,
        itermSessionId: session.itermSessionId,
      }),
    }).catch((err) => console.error("Failed to focus Claude session:", err));
  }, []);

  const [hostname, setHostname] = useState("localhost");
  useEffect(() => {
    setHostname(globalThis.location.hostname);
  }, []);

  const [pollInterval, setPollInterval] = useState(5000);
  const [characters, setCharacters] = useState<Record<string, Character>>({});

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to fetch settings:", res.status);
          return null;
        }
        return res.json();
      })
      .then((settings: Settings | null) => {
        if (settings) {
          setPollInterval(settings.pollInterval);
          setCharacters(settings.characters);
        }
      })
      .catch((err) => console.error("Failed to fetch settings:", err));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const refreshServers = async () => {
      setIsRefreshing(true);
      try {
        const response = await fetch("/api/servers");
        if (response.ok) {
          const data = await response.json();
          setServers(data);
        }
      } catch (error) {
        console.error("Failed to refresh servers:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    const intervalId = setInterval(refreshServers, pollInterval);
    return () => clearInterval(intervalId);
  }, [pollInterval]);

  if (servers.length === 0) {
    return (
      <div class="text-center py-16 px-4">
        <div class="text-5xl mb-4">😴</div>
        <h3 class="text-xl font-heading font-semibold text-charcoal mb-2">
          The town is quiet...
        </h3>
        <p class="text-bark text-sm max-w-sm mx-auto">
          Start a local development server and a new townsperson will move in!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Nav bar */}
      <nav class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-heading font-bold text-charcoal tracking-tight">
          John Town
        </h1>
        <div class="flex items-center gap-3">
          <span class="text-xs text-pebble flex items-center gap-1.5">
            {isRefreshing
              ? (
                <>
                  <span class="w-1.5 h-1.5 bg-meadow rounded-full animate-pulse" />
                  Refreshing...
                </>
              )
              : (
                <>
                  <span class="w-1.5 h-1.5 bg-pebble/40 rounded-full" />
                  Auto-refresh {pollInterval / 1000}s
                </>
              )}
          </span>
          <a
            href="/settings"
            class="text-pebble hover:text-charcoal transition-colors duration-150"
            title="Town Settings"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473c.497.179.971.405 1.416.67l1.39-.57a1 1 0 011.12.303l.96 1.18a1 1 0 01.063 1.205l-.795 1.175a7.06 7.06 0 01.099 1.52l1.03.96a1 1 0 01.204 1.175l-.62 1.12a1 1 0 01-1.065.522l-1.38-.27a7.09 7.09 0 01-1.11.932l.14 1.422a1 1 0 01-.607 1.03l-1.26.494a1 1 0 01-1.12-.303l-.88-1.086a7.122 7.122 0 01-1.53 0l-.88 1.086a1 1 0 01-1.12.303l-1.26-.494a1 1 0 01-.607-1.03l.14-1.422a7.08 7.08 0 01-1.11-.932l-1.38.27a1 1 0 01-1.065-.522l-.62-1.12a1 1 0 01.204-1.176l1.03-.96a7.06 7.06 0 01.099-1.52l-.795-1.174a1 1 0 01.063-1.206l.96-1.18a1 1 0 011.12-.302l1.39.57c.445-.266.919-.492 1.416-.67L8.34 1.804zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>
      </nav>

      {/* Table container with ledger border and warm shadow */}
      <div
        class="bg-cream border-2 border-pebble rounded-lg overflow-hidden"
        style={{
          boxShadow:
            "0 4px 12px rgba(160, 113, 79, 0.1), 0 1px 3px rgba(160, 113, 79, 0.08)",
        }}
      >
        {/* Header row — desktop only */}
        <div
          class="hidden md:grid items-center gap-x-4 px-4 py-2.5 bg-sand border-b-2 border-pebble"
          style={{ gridTemplateColumns: TABLE_COLUMNS }}
        >
          {["Project", "Process", "Git", "Claude"].map((label) => (
            <span
              key={label}
              class="text-xs font-heading font-semibold uppercase tracking-wider text-warm-brown"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Server rows */}
        {servers.map((server) => (
          <ServerCard
            key={`${server.pid}-${server.port}`}
            server={server}
            character={characters[server.framework] ?? DEFAULT_CHARACTER}
            hostname={hostname}
            onClaudeFocus={handleClaudeFocus}
          />
        ))}
      </div>
    </div>
  );
}
