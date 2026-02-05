/**
 * ServerList Island
 *
 * An interactive island component that displays a list of running servers
 * and automatically refreshes every 5 seconds to detect new or stopped servers.
 *
 * Islands in Fresh are components that hydrate on the client side, enabling
 * interactivity like auto-refresh without full page reloads.
 */

import { useEffect, useState } from "preact/hooks";
import { ServerCard } from "@/components/ServerCard.tsx";
import type { DevServer } from "@/lib/port-scanner.ts";

interface ServerListProps {
  initialServers: DevServer[];
}

export default function ServerList({ initialServers }: ServerListProps) {
  // State to hold the current list of servers
  const [servers, setServers] = useState<DevServer[]>(initialServers);

  // State to track if we're currently refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 seconds
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

    // Set up the interval for auto-refresh
    const intervalId = setInterval(refreshServers, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Empty state - no servers running
  if (servers.length === 0) {
    return (
      <div class="text-center py-16 px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          No servers running
        </h3>
        <p class="text-gray-500 text-sm max-w-sm mx-auto">
          Start a local development server and it will automatically appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with count and refresh status */}
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">
          {servers.length} server{servers.length !== 1 ? "s" : ""} running
        </p>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          {isRefreshing && (
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Updating...
            </span>
          )}
        </div>
      </div>

      {/* Grid of server cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map((server) => (
          <ServerCard key={`${server.pid}-${server.port}`} server={server} />
        ))}
      </div>
    </div>
  );
}
