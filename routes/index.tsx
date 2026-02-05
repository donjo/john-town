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
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>John Town</title>
      </Head>

      {/* Header */}
      <header class="px-4 py-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900">Welcome to John Town</h1>
        <p class="mt-2 text-gray-600">Your local development servers</p>
      </header>

      {/* Server list */}
      <main class="max-w-screen-lg mx-auto px-4 pb-8">
        <ServerList initialServers={servers} />
      </main>
    </div>
  );
});
