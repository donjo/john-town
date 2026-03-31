/**
 * Settings endpoint — read and update configuration in memory.
 *
 * GET    /api/settings -> returns current settings
 * PUT    /api/settings -> updates settings in memory
 * DELETE /api/settings -> resets to defaults
 */

import { define } from "@/utils.ts";
import {
  getSettings,
  resetSettings,
  type Settings,
  updateSettings,
} from "@/lib/settings.ts";

export const handler = define.handlers({
  GET(): Response {
    return Response.json(getSettings());
  },

  async PUT(ctx): Promise<Response> {
    const body = await ctx.req.json();

    if (
      !Array.isArray(body.portRanges) ||
      !Array.isArray(body.excludedProcesses) ||
      typeof body.pollInterval !== "number" ||
      body.pollInterval < 1000 ||
      typeof body.characters !== "object" ||
      body.characters === null
    ) {
      return Response.json({ error: "Invalid settings" }, { status: 400 });
    }

    updateSettings(body as Settings);
    return Response.json(getSettings());
  },

  DELETE(): Response {
    return Response.json(resetSettings());
  },
});
