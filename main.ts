import { App, staticFiles } from "fresh";
import type { State } from "./utils.ts";
import {
  checkTailscaleAvailable,
  cleanupStaleServes,
  registerShutdownHandlers,
  syncTailscaleServes,
} from "./lib/tailscale-serve.ts";
import { scanPorts } from "./lib/port-scanner.ts";

export const app = new App<State>();

app.use(staticFiles());

app.fsRoutes();

// Tailscale serve setup: expose dev servers to your tailnet automatically.
// If Tailscale isn't installed or running, this is all safely skipped.
const tailscaleReady = await checkTailscaleAvailable();
if (tailscaleReady) {
  // Clean up any leftover serves from a previous crash
  await cleanupStaleServes();

  // Do an initial port scan + sync so serves are ready immediately
  const servers = await scanPorts();
  await syncTailscaleServes(servers);

  // Register Ctrl+C / kill handlers so we clean up on exit
  registerShutdownHandlers();
}
