/**
 * Claude Session Scanner
 *
 * Detects active Claude Code sessions running on your machine.
 * For each dev server, it checks whether there's a Claude Code process
 * running in that project directory, and if so, whether Claude is
 * waiting for your input or actively working.
 *
 * How it works:
 * 1. Finds running `claude` processes using `pgrep`
 * 2. Reads each process's environment variables (via `ps eww`) to get
 *    the working directory (PWD) and terminal info
 * 3. Reads the Claude session JSONL file to determine status
 * 4. Matches sessions to dev servers by project path
 */

import { runCommand } from "@/lib/port-scanner.ts";

/**
 * Represents an active Claude Code session detected on the machine.
 * Contains enough info to display status and focus the terminal.
 */
export interface ClaudeSession {
  pid: number;
  projectPath: string;
  status: "waiting" | "working";
  termProgram: string;
  itermSessionId?: string;
}

/**
 * Pulls a specific environment variable value out of `ps eww` output.
 * Environment variables appear at the end of the command line as KEY=VALUE pairs.
 */
function extractEnvVar(psOutput: string, varName: string): string | undefined {
  const regex = new RegExp(`(?:^|\\s)${varName}=([^\\s]+)`);
  const match = psOutput.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Finds all active Claude Code sessions by scanning running processes.
 *
 * Steps:
 * - Uses `pgrep` to find processes named "claude"
 * - For each, reads environment variables to get the project directory
 * - Reads the session JSONL file to check if Claude is waiting or working
 */
export async function scanClaudeSessions(): Promise<ClaudeSession[]> {
  const sessions: ClaudeSession[] = [];

  // Find all processes named "claude"
  const { output: pgrepOutput } = await runCommand(["pgrep", "-x", "claude"]);
  if (!pgrepOutput) return [];

  const pids = pgrepOutput
    .split("\n")
    .map((p) => parseInt(p.trim(), 10))
    .filter((p) => !isNaN(p));

  if (pids.length === 0) return [];

  // Check each process for its working directory and terminal info
  for (const pid of pids) {
    const { output: psOutput } = await runCommand([
      "ps",
      "eww",
      "-p",
      String(pid),
      "-o",
      "tty=,command=",
    ]);

    if (!psOutput) continue;

    // Skip processes without a TTY (background/daemon processes)
    const ttyMatch = psOutput.match(/^(\S+)/);
    if (!ttyMatch || ttyMatch[1] === "??") continue;

    // Extract key environment variables from the process
    const pwd = extractEnvVar(psOutput, "PWD");
    const termProgram = extractEnvVar(psOutput, "TERM_PROGRAM") || "unknown";
    const itermSessionId = extractEnvVar(psOutput, "ITERM_SESSION_ID");

    if (!pwd) continue;

    // Read the Claude session file to determine waiting vs working status
    const status = await getSessionStatus(pwd);
    if (!status) continue;

    sessions.push({
      pid,
      projectPath: pwd,
      status,
      termProgram,
      itermSessionId,
    });
  }

  return sessions;
}

/**
 * Converts a project path to Claude's directory naming format.
 * Claude stores session files in directories named by replacing "/" with "-".
 * Example: "/Users/john/project" becomes "-Users-john-project"
 */
function encodeProjectPath(projectPath: string): string {
  return projectPath.replace(/[/.]/g, "-");
}

/**
 * Reads the most recent Claude session JSONL file for a project
 * and figures out whether Claude is waiting for input or actively working.
 *
 * It reads the last chunk of the file and looks at the last meaningful entry:
 * - Assistant message without tool_use → "waiting" (Claude finished, your turn)
 * - Assistant message with tool_use → "working" (Claude is using a tool)
 * - User message with tool_result → "working" (tool result being processed)
 */
async function getSessionStatus(
  projectPath: string,
): Promise<"waiting" | "working" | null> {
  const homeDir = Deno.env.get("HOME");
  if (!homeDir) return null;

  const encodedPath = encodeProjectPath(projectPath);
  const sessionDir = `${homeDir}/.claude/projects/${encodedPath}`;

  // Find the most recently modified .jsonl file in the session directory
  let latestFile: string | null = null;
  let latestMtime = 0;

  try {
    for await (const entry of Deno.readDir(sessionDir)) {
      if (!entry.name.endsWith(".jsonl") || !entry.isFile) continue;

      const filePath = `${sessionDir}/${entry.name}`;
      try {
        const stat = await Deno.stat(filePath);
        const mtime = stat.mtime?.getTime() || 0;
        if (mtime > latestMtime) {
          latestMtime = mtime;
          latestFile = filePath;
        }
      } catch {
        // Can't stat this file, skip it
      }
    }
  } catch {
    // Session directory doesn't exist for this project
    return null;
  }

  if (!latestFile) return null;

  // Only consider sessions active if the file was modified in the last 5 minutes
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  if (latestMtime < fiveMinutesAgo) return null;

  // Use file modification time as the primary signal for status.
  // When Claude is actively working (streaming text, running tools, writing
  // progress updates), the JSONL file is constantly being written to. When
  // Claude finishes and waits for user input, the file stops changing.
  const fifteenSecondsAgo = Date.now() - 15 * 1000;
  if (latestMtime > fifteenSecondsAgo) return "working";

  // File was modified between 15 seconds and 5 minutes ago — Claude is idle
  return "waiting";
}

/**
 * Focuses the terminal window/tab where a Claude session is running.
 *
 * For iTerm2: Uses AppleScript to find the specific tab by session ID
 * and bring it to the front. This is the best experience since it
 * jumps directly to the right tab.
 *
 * For other terminals: Falls back to `open -a` which just brings
 * the terminal app to the foreground.
 */
/** Allowed terminal apps for the focus fallback (prevents arbitrary app launching) */
const ALLOWED_TERMINALS = [
  "iTerm.app",
  "iTerm2",
  "Terminal",
  "Alacritty",
  "WezTerm",
  "kitty",
  "Hyper",
  "Warp",
  "Rio",
  "zed",
  "Zed",
];

/** Validates that a string looks like a UUID (hex + dashes only) */
function isValidUUID(value: string): boolean {
  return /^[\da-f-]+$/i.test(value);
}

export async function focusTerminalSession(
  session: Pick<ClaudeSession, "pid" | "termProgram" | "itermSessionId">,
): Promise<boolean> {
  // iTerm2 supports finding a specific tab by session ID via AppleScript
  if (session.termProgram === "iTerm.app" && session.itermSessionId) {
    // The ITERM_SESSION_ID env var looks like "w0t1p0:C3D91F33-..."
    // but iTerm's AppleScript "unique id" returns just the UUID after the colon
    const sessionUUID = session.itermSessionId.split(":").pop() ??
      session.itermSessionId;

    // Validate the UUID to prevent AppleScript injection
    if (!isValidUUID(sessionUUID)) {
      return false;
    }

    const script = `
      tell application "iTerm"
        activate
        repeat with w in windows
          repeat with t in tabs of w
            repeat with s in sessions of t
              if unique id of s is "${sessionUUID}" then
                select t
                return true
              end if
            end repeat
          end repeat
        end repeat
      end tell
      return false
    `;

    const { output } = await runCommand(["osascript", "-e", script]);
    return output === "true";
  }

  // Fallback: just bring the terminal app to the front
  const appName = session.termProgram || "Terminal";
  if (!ALLOWED_TERMINALS.includes(appName)) {
    return false;
  }
  await runCommand(["open", "-a", appName]);
  return true;
}
