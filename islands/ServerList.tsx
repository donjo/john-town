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

  // Detect what hostname the user is browsing from (e.g. "localhost" vs a Tailscale hostname).
  // Defaults to "localhost" during server-side render, then updates on the client.
  const [hostname, setHostname] = useState("localhost");
  useEffect(() => {
    setHostname(globalThis.location.hostname);
  }, []);

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
      {/* Server cards */}
      <div class="flex flex-col gap-4">
        {servers.map((server) => (
          <ServerCard
            key={`${server.pid}-${server.port}`}
            server={server}
            hostname={hostname}
          />
        ))}
      </div>

      {/* Footer: count and refresh status */}
      <div class="flex items-center justify-between mt-6 pt-4 text-xs text-pebble">
        <span>
          {servers.length} townsperson{servers.length !== 1 ? "s" : ""} at work
        </span>
        {isRefreshing
          ? (
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-meadow rounded-full animate-pulse" />
              Checking in...
            </span>
          )
          : <span>Auto-refreshing every 5s</span>}
      </div>
    </div>
  );
}
