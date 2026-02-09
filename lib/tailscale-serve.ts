/**
 * Tailscale Serve Manager
 *
 * Automatically exposes detected dev servers to your Tailscale network
 * using `tailscale serve`. When a new dev server is found, it gets
 * proxied so other devices on your tailnet can access it directly.
 *
 * If Tailscale isn't installed or running, everything is safely skipped
 * and John Town works normally on localhost.
 */

import type { DevServer } from "./port-scanner.ts";

// Path where we save which ports we're managing, so we can clean up after crashes
const STATE_FILE = "/tmp/john-town-serves.json";

// Tracks whether Tailscale is available on this machine
let tailscaleAvailable = false;

// The set of ports we've told Tailscale to serve
const activePorts = new Set<number>();

/**
 * Runs a shell command and returns whether it succeeded.
 * Also returns the stdout text for commands that need it.
 */
async function runCommand(
  cmd: string[],
): Promise<{ success: boolean; output: string }> {
  try {
    const command = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdout: "piped",
      stderr: "piped",
    });
    const result = await command.output();
    return {
      success: result.success,
      output: new TextDecoder().decode(result.stdout).trim(),
    };
  } catch {
    return { success: false, output: "" };
  }
}

/**
 * Checks if Tailscale is installed and connected.
 * Call this once at startup — if it fails, all other functions become no-ops.
 */
export async function checkTailscaleAvailable(): Promise<boolean> {
  const result = await runCommand(["tailscale", "status"]);
  tailscaleAvailable = result.success;

  if (!tailscaleAvailable) {
    console.log("Tailscale not detected, remote proxy disabled");
  } else {
    console.log("Tailscale detected, remote proxy enabled");
  }

  return tailscaleAvailable;
}

/**
 * Returns whether Tailscale is available (set by checkTailscaleAvailable).
 */
export function isTailscaleAvailable(): boolean {
  return tailscaleAvailable;
}

/**
 * Saves the current set of active ports to disk.
 * This lets us clean up if John Town crashes without running its shutdown handler.
 */
async function saveState(): Promise<void> {
  try {
    const data = JSON.stringify([...activePorts]);
    await Deno.writeTextFile(STATE_FILE, data);
  } catch {
    // Not critical — worst case we leave a stale serve entry
  }
}

/**
 * Reads the state file to find ports from a previous session.
 * Returns the port numbers, or an empty array if there's no file.
 */
async function loadState(): Promise<number[]> {
  try {
    const text = await Deno.readTextFile(STATE_FILE);
    const ports = JSON.parse(text);
    if (Array.isArray(ports) && ports.every((p) => typeof p === "number")) {
      return ports;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Removes the state file from disk.
 */
async function removeState(): Promise<void> {
  try {
    await Deno.remove(STATE_FILE);
  } catch {
    // File might not exist — that's fine
  }
}

/**
 * Tells Tailscale to start serving a local port to the tailnet.
 * This makes the dev server accessible from any device on your Tailscale network.
 */
async function addServe(port: number): Promise<boolean> {
  const result = await runCommand([
    "tailscale",
    "serve",
    `--http=${port}`,
    "--bg",
    `localhost:${port}`,
  ]);

  if (result.success) {
    console.log(`Tailscale: serving port ${port}`);
    return true;
  } else {
    console.log(`Tailscale: failed to serve port ${port}`);
    return false;
  }
}

/**
 * Tells Tailscale to stop serving a port.
 */
async function removeServe(port: number): Promise<void> {
  const result = await runCommand([
    "tailscale",
    "serve",
    `--http=${port}`,
    "off",
  ]);

  if (result.success) {
    console.log(`Tailscale: stopped serving port ${port}`);
  } else {
    console.log(`Tailscale: failed to stop serving port ${port}`);
  }
}

/**
 * Syncs Tailscale serves with the currently detected dev servers.
 *
 * - If a new server appeared, start serving its port
 * - If a server disappeared, stop serving its port
 *
 * Called every time the API returns server data (every ~5 seconds).
 */
export async function syncTailscaleServes(
  servers: DevServer[],
): Promise<void> {
  if (!tailscaleAvailable) return;

  // Build a set of ports that are currently running
  const currentPorts = new Set(servers.map((s) => s.port));

  // Add serves for new ports
  for (const port of currentPorts) {
    if (!activePorts.has(port)) {
      const ok = await addServe(port);
      if (ok) {
        activePorts.add(port);
      }
    }
  }

  // Remove serves for ports that stopped
  for (const port of activePorts) {
    if (!currentPorts.has(port)) {
      await removeServe(port);
      activePorts.delete(port);
    }
  }

  // Save state so we can recover from crashes
  await saveState();
}

/**
 * Removes all Tailscale serves that John Town created.
 * Called on shutdown (Ctrl+C) and on startup (to clean up from crashes).
 */
export async function cleanupAllServes(): Promise<void> {
  if (!tailscaleAvailable) return;

  for (const port of activePorts) {
    await removeServe(port);
  }
  activePorts.clear();
  await removeState();
}

/**
 * Cleans up stale serves left behind by a previous crash.
 * Reads the state file, removes those serves, then deletes the file.
 */
export async function cleanupStaleServes(): Promise<void> {
  if (!tailscaleAvailable) return;

  const stalePorts = await loadState();
  if (stalePorts.length === 0) return;

  console.log(
    `Tailscale: cleaning up ${stalePorts.length} stale serve(s) from previous session`,
  );

  for (const port of stalePorts) {
    await removeServe(port);
  }

  await removeState();
}

/**
 * Registers signal handlers so serves get cleaned up on Ctrl+C or termination.
 */
export function registerShutdownHandlers(): void {
  if (!tailscaleAvailable) return;

  const shutdown = async () => {
    console.log("\nCleaning up Tailscale serves...");
    await cleanupAllServes();
    Deno.exit(0);
  };

  Deno.addSignalListener("SIGINT", () => {
    shutdown();
  });
  Deno.addSignalListener("SIGTERM", () => {
    shutdown();
  });
}
