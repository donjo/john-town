/**
 * Port Scanner Library
 *
 * This library scans for running local development servers by using the
 * macOS `lsof` command to find processes listening on specific ports.
 * It then extracts information about each server including the project
 * name, framework, and git branch.
 */

import {
  type ClaudeSession,
  scanClaudeSessions,
} from "@/lib/claude-session.ts";
import { getSettings, type Settings } from "@/lib/settings.ts";

/**
 * Represents a detected local development server
 */
export interface DevServer {
  port: number;
  host: string;
  pid: number;
  projectName: string;
  projectPath: string;
  framework: string;
  command: string;
  gitBranch?: string;
  gitWorktree?: string;
  isWorktree: boolean;
  gitDirty: boolean;
  uptime?: string;
  memoryMB?: number;
  claudeSession?: ClaudeSession;
}

/**
 * Runs a shell command and returns whether it succeeded plus its output.
 * On failure (non-zero exit or exception), returns { success: false, output: "" }.
 */
export async function runCommand(
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
 * Gets the working directory of a process by its PID.
 * Uses `lsof` to find the current working directory.
 */
async function getProcessWorkingDir(pid: number): Promise<string> {
  // On macOS, we can use lsof to find the working directory
  const { output: lsofOut } = await runCommand([
    "lsof",
    "-p",
    String(pid),
    "-Fn",
  ]);

  // Look for the cwd entry (current working directory)
  // lsof output format: each line starts with a type character, followed by the value
  const lines = lsofOut.split("\n");
  for (const line of lines) {
    // 'n' prefix indicates a filename, and 'cwd' type indicates current working directory
    if (line.startsWith("n") && !line.includes("/dev/")) {
      const path = line.slice(1); // Remove the 'n' prefix
      // We want directories, not files
      try {
        const stat = await Deno.stat(path);
        if (stat.isDirectory) {
          return path;
        }
      } catch {
        // Path doesn't exist or can't be accessed
      }
    }
  }

  // Fallback: try using ps to get command and extract path
  const { output: psOut } = await runCommand([
    "ps",
    "-p",
    String(pid),
    "-o",
    "command=",
  ]);
  // Look for absolute paths in the command
  const pathMatch = psOut.match(/\/[\w/.-]+/);
  if (pathMatch) {
    const foundPath = pathMatch[0];
    try {
      const stat = await Deno.stat(foundPath);
      if (stat.isDirectory) {
        return foundPath;
      }
      // If it's a file, return its directory
      const dir = foundPath.split("/").slice(0, -1).join("/");
      if (dir) {
        return dir;
      }
    } catch {
      // Path doesn't exist
    }
  }

  return "";
}

/**
 * Gets the full command line of a process by its PID
 */
async function getProcessCommand(pid: number): Promise<string> {
  const { output } = await runCommand([
    "ps",
    "-p",
    String(pid),
    "-o",
    "command=",
  ]);
  return output;
}

/**
 * Detects the framework based on the process command and project files.
 * Looks for common patterns in the command line.
 */
function detectFramework(command: string): string {
  const cmd = command.toLowerCase();

  // Check for specific framework patterns
  if (cmd.includes("vite") || (cmd.includes("npm") && cmd.includes("dev"))) {
    return "Vite";
  }
  if (cmd.includes("fresh") || cmd.includes("@fresh")) {
    return "Fresh";
  }
  if (cmd.includes("next")) {
    return "Next.js";
  }
  if (cmd.includes("remix")) {
    return "Remix";
  }
  if (cmd.includes("nuxt")) {
    return "Nuxt";
  }
  if (cmd.includes("astro")) {
    return "Astro";
  }
  if (cmd.includes("rails") || cmd.includes("ruby")) {
    return "Rails";
  }
  if (
    cmd.includes("django") || (cmd.includes("python") && cmd.includes("manage"))
  ) {
    return "Django";
  }
  if (cmd.includes("flask")) {
    return "Flask";
  }
  if (cmd.includes("phoenix") || cmd.includes("elixir")) {
    return "Phoenix";
  }
  if (cmd.includes("deno")) {
    return "Deno";
  }
  if (cmd.includes("node")) {
    return "Node.js";
  }
  if (cmd.includes("python")) {
    return "Python";
  }
  if (cmd.includes("jupyter")) {
    return "Jupyter";
  }

  return "Unknown";
}

/**
 * Generic directory names that don't make good project names.
 * If the working directory ends with one of these, we go up a level
 * to find the actual project folder.
 */
const GENERIC_DIR_NAMES = new Set([
  "src",
  "source",
  "app",
  "lib",
  "dist",
  "build",
  "public",
  "server",
  "client",
  "web",
  "frontend",
  "backend",
  "packages",
  "cmd",
  "bin",
]);

/**
 * Extracts the project name from a file path.
 * If the last directory component is generic (like "src"), walks up
 * to the parent to find a more meaningful project name.
 */
function deriveProjectName(projectPath: string): string {
  if (!projectPath) {
    return "Unknown";
  }

  const parts = projectPath.split("/").filter((p) => p);
  const last = parts[parts.length - 1];

  if (!last) return "Unknown";

  // If the directory name is generic, use the parent instead
  if (GENERIC_DIR_NAMES.has(last.toLowerCase()) && parts.length > 1) {
    return parts[parts.length - 2];
  }

  return last;
}

/**
 * Gets git information for a project directory.
 * Returns the current branch name and whether it's a worktree.
 */
async function getGitInfo(
  projectPath: string,
): Promise<{ branch?: string; worktree?: string; isWorktree: boolean }> {
  if (!projectPath) {
    return { isWorktree: false };
  }

  // Check if this is a git repository at all
  const { output: gitCheck } = await runCommand([
    "git",
    "-C",
    projectPath,
    "rev-parse",
    "--is-inside-work-tree",
  ]);
  if (gitCheck !== "true") {
    return { isWorktree: false };
  }

  // Get the current branch name
  const { output: branch } = await runCommand([
    "git",
    "-C",
    projectPath,
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);

  // Check if this is a worktree by seeing if .git is a file (not a directory)
  // In a worktree, .git is a file that points to the main repository
  let isWorktree = false;
  let worktree: string | undefined;

  try {
    const gitPath = `${projectPath}/.git`;
    const stat = await Deno.stat(gitPath);
    isWorktree = stat.isFile; // If .git is a file, it's a worktree

    if (isWorktree) {
      // Extract the worktree name from the path
      worktree = deriveProjectName(projectPath);
    }
  } catch {
    // .git doesn't exist or can't be accessed
  }

  return {
    branch: branch || undefined,
    worktree,
    isWorktree,
  };
}

/**
 * Checks if a git repo has uncommitted changes (staged or unstaged).
 * Returns true if there are any modifications.
 */
async function getGitDirty(projectPath: string): Promise<boolean> {
  if (!projectPath) return false;

  const { output } = await runCommand([
    "git",
    "-C",
    projectPath,
    "status",
    "--porcelain",
  ]);

  return output.length > 0;
}

/**
 * Gets how long a process has been running.
 * Uses `ps` elapsed time format, then converts to a readable string.
 * ps etime format: [[dd-]hh:]mm:ss
 */
async function getProcessUptime(pid: number): Promise<string | undefined> {
  const { output: raw } = await runCommand([
    "ps",
    "-p",
    String(pid),
    "-o",
    "etime=",
  ]);
  if (!raw) return undefined;

  // Parse the etime format: "dd-hh:mm:ss", "hh:mm:ss", or "mm:ss"
  const trimmed = raw.trim();
  const dayMatch = trimmed.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    const hours = parseInt(dayMatch[2]);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }

  const hourMatch = trimmed.match(/^(\d+):(\d+):(\d+)$/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    const mins = parseInt(hourMatch[2]);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  const minMatch = trimmed.match(/^(\d+):(\d+)$/);
  if (minMatch) {
    const mins = parseInt(minMatch[1]);
    if (mins > 0) return `${mins}m`;
    return "<1m";
  }

  return trimmed;
}

/**
 * Gets the memory usage of a process in megabytes.
 * Uses `ps` RSS (resident set size) which is in kilobytes.
 */
async function getProcessMemory(pid: number): Promise<number | undefined> {
  const { output: raw } = await runCommand([
    "ps",
    "-p",
    String(pid),
    "-o",
    "rss=",
  ]);
  if (!raw) return undefined;

  const kb = parseInt(raw.trim(), 10);
  if (isNaN(kb)) return undefined;

  return Math.round(kb / 1024);
}

/**
 * Parses lsof output to extract port, PID, and process name.
 * lsof output format varies, but typically includes lines like:
 * node    12345 user   20u  IPv4 0x...      0t0  TCP *:8000 (LISTEN)
 */
interface LsofEntry {
  pid: number;
  port: number;
  processName: string;
}

function parseLsofOutput(output: string): LsofEntry[] {
  const entries: LsofEntry[] = [];
  const lines = output.split("\n").filter((line) => line.includes("LISTEN"));

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;

    // Process name is the first field
    const processName = parts[0];

    // PID is the second field
    const pid = parseInt(parts[1], 10);
    if (isNaN(pid)) continue;

    // Extract port from the address field (usually looks like *:8000 or localhost:8000)
    const addressField = parts.find((p) =>
      p.includes(":") && !p.includes("0x")
    );
    if (!addressField) continue;

    const portMatch = addressField.match(/:(\d+)$/);
    if (!portMatch) continue;

    const port = parseInt(portMatch[1], 10);
    if (isNaN(port)) continue;

    entries.push({ pid, port, processName });
  }

  return entries;
}

/**
 * Checks if a process should be excluded based on its name.
 */
function isExcludedProcess(
  processName: string,
  settings: Settings,
): boolean {
  return settings.excludedProcesses.some(
    (excluded) => processName.toLowerCase().startsWith(excluded.toLowerCase()),
  );
}

/**
 * Checks if a port falls within any of the specified ranges.
 */
function isPortInRanges(port: number, ranges: [number, number][]): boolean {
  return ranges.some(([start, end]) => port >= start && port <= end);
}

/**
 * Main function to scan for running development servers.
 * Scans the specified port ranges (or defaults) and returns info about each server.
 */
export async function scanPorts(): Promise<DevServer[]> {
  const settings = getSettings();
  const portRanges: [number, number][] = settings.portRanges.map((
    r,
  ) => [r.start, r.end]);
  const servers: DevServer[] = [];
  const seenPids = new Set<number>();

  // Start Claude session scanning early — it runs independently of port data
  const claudeSessionsPromise = scanClaudeSessions();

  // Get all listening TCP sockets, then filter by port range
  const { output } = await runCommand([
    "lsof",
    "-n",
    "-P",
    "-iTCP",
    "-sTCP:LISTEN",
  ]);

  if (!output) {
    return [];
  }

  // Parse and filter to only include ports in our ranges, excluding system processes
  const allEntries = parseLsofOutput(output);
  const entries = allEntries.filter(
    (e) =>
      isPortInRanges(e.port, portRanges) &&
      !isExcludedProcess(e.processName, settings),
  );

  for (const entry of entries) {
    // Skip if we've already processed this PID (same server on multiple ports)
    if (seenPids.has(entry.pid)) {
      continue;
    }
    seenPids.add(entry.pid);

    // Skip the current process (John Town itself)
    if (entry.pid === Deno.pid) {
      continue;
    }

    // Get process details
    const [command, projectPath] = await Promise.all([
      getProcessCommand(entry.pid),
      getProcessWorkingDir(entry.pid),
    ]);

    const framework = detectFramework(command);
    const projectName = deriveProjectName(projectPath);

    const [gitInfo, gitDirty, uptime, memoryMB] = await Promise.all([
      getGitInfo(projectPath),
      getGitDirty(projectPath),
      getProcessUptime(entry.pid),
      getProcessMemory(entry.pid),
    ]);

    servers.push({
      port: entry.port,
      host: "localhost",
      pid: entry.pid,
      projectName,
      projectPath,
      framework,
      command,
      gitBranch: gitInfo.branch,
      gitWorktree: gitInfo.worktree,
      isWorktree: gitInfo.isWorktree,
      gitDirty,
      uptime,
      memoryMB,
    });
  }

  // Match Claude Code sessions to servers by project path
  const claudeSessions = await claudeSessionsPromise;
  for (const session of claudeSessions) {
    const match = servers.find((s) => s.projectPath === session.projectPath);
    if (match) {
      match.claudeSession = session;
    }
  }

  // Sort by port number for consistent display
  servers.sort((a, b) => a.port - b.port);

  return servers;
}
