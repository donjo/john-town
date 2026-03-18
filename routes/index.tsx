/**
 * Homepage - John Town Dashboard
 *
 * This is the main page that displays all running local development servers.
 * It fetches the initial list of servers on the server side, then the
 * ServerList island takes over to auto-refresh the list.
 */

import { define } from "../utils.ts";
import { scanPorts } from "@/lib/port-scanner.ts";
import ServerList from "../islands/ServerList.tsx";

export default define.page(async function Home() {
  const servers = await scanPorts();

  return (
    <div
      class="min-h-screen"
      style={{
        backgroundColor: "#fdf5eb",
        backgroundImage:
          "linear-gradient(90deg, #e0c9a830 20px, transparent 20px), linear-gradient(#e0c9a830 20px, transparent 20px)",
        backgroundPosition: "10px 10px",
        backgroundSize: "40px 40px",
      }}
    >
      <main class="px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <ServerList initialServers={servers} />
      </main>
    </div>
  );
});
