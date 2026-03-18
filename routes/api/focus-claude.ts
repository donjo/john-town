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

      // Validate pid is a positive integer
      if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0) {
        return Response.json({ error: "Invalid pid" }, { status: 400 });
      }

      // Validate termProgram is a non-empty string
      if (typeof termProgram !== "string" || !termProgram) {
        return Response.json({ error: "Missing termProgram" }, { status: 400 });
      }

      // Validate itermSessionId format if provided
      if (
        itermSessionId !== undefined &&
        (typeof itermSessionId !== "string" || !itermSessionId)
      ) {
        return Response.json({ error: "Invalid itermSessionId" }, {
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
