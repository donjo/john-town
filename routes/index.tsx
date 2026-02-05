/**
 * Homepage - John Town Dashboard
 *
 * This is the main page that displays all running local development servers.
 * It fetches the initial list of servers on the server side, then the
 * ServerList island takes over to auto-refresh the list.
 */

import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { scanPorts } from "@/lib/port-scanner.ts";
import ServerList from "../islands/ServerList.tsx";

export default define.page(async function Home() {
  const servers = await scanPorts();

  return (
    <div
      class="min-h-screen bg-cream"
      style={{
        backgroundImage:
          "radial-gradient(var(--color-pebble) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <Head>
        <title>John Town</title>
      </Head>

      {/* Header */}
      <header class="px-4 pt-10 pb-6 text-center">
        <h1 class="text-4xl font-heading font-bold text-charcoal tracking-tight">
          Welcome to John Town
        </h1>
        <p class="mt-2 text-bark text-lg">
          Your local development neighborhood
        </p>
      </header>

      {/* Server list */}
      <main class="max-w-screen-lg mx-auto px-4 pb-10">
        <ServerList initialServers={servers} />
      </main>
    </div>
  );
});
