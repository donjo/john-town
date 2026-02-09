/**
 * API endpoint that returns information about running local development servers.
 *
 * This route calls the port scanner to find all HTTP servers running on common
 * development ports, then returns the list as JSON.
 *
 * GET /api/servers -> returns array of DevServer objects
 */

import { define } from "@/utils.ts";
import { type DevServer, scanPorts } from "@/lib/port-scanner.ts";
import { syncTailscaleServes } from "@/lib/tailscale-serve.ts";

export const handler = define.handlers({
  async GET(): Promise<Response> {
    const servers: DevServer[] = await scanPorts();

    // Keep Tailscale serves in sync with detected servers
    await syncTailscaleServes(servers);

    return Response.json(servers);
  },
});
