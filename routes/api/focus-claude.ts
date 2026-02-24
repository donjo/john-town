/**
 * API endpoint to focus the terminal where a Claude Code session is running.
 *
 * POST /api/focus-claude
 * Body: { pid: number, termProgram: string, itermSessionId?: string }
 *
 * For iTerm2, this uses AppleScript to find the exact tab and bring it
 * to the front. For other terminals, it just activates the app.
 */

import { define } from "@/utils.ts";
import { focusTerminalSession } from "@/lib/claude-session.ts";

export const handler = define.handlers({
  async POST(ctx): Promise<Response> {
    try {
      const body = await ctx.req.json();
      const { pid, termProgram, itermSessionId } = body;

      if (!pid || !termProgram) {
        return Response.json({ error: "Missing pid or termProgram" }, {
          status: 400,
        });
      }

      const success = await focusTerminalSession({
        pid,
        termProgram,
        itermSessionId,
      });

      return Response.json({ success });
    } catch {
      return Response.json({ error: "Failed to focus terminal" }, {
        status: 500,
      });
    }
  },
});
