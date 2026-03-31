import fetcher from "./_fresh/server.js";

const preferredPort = Number(Deno.env.get("PORT")) || 3333;
const hostname = Deno.env.get("HOSTNAME") || "0.0.0.0";

// deno-lint-ignore no-explicit-any
const handler = fetcher.fetch as any;

function onListen({ port }: { port: number }) {
  const url = `http://localhost:${port}`;
  console.log(`John Town running at ${url}`);
  new Deno.Command("open", { args: [url] }).spawn();
}

// Try preferred port, fall back to OS-assigned on conflict
try {
  Deno.serve({ port: preferredPort, hostname, onListen }, handler);
} catch {
  Deno.serve({ port: 0, hostname, onListen }, handler);
}
