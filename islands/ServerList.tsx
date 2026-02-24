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

    const intervalId = setInterval(refreshServers, 5000);
    return () => clearInterval(intervalId);
  }, []);

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
                Auto-refresh 5s
              </>
            )}
        </span>
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
            hostname={hostname}
            onClaudeFocus={handleClaudeFocus}
          />
        ))}
      </div>
    </div>
  );
}
