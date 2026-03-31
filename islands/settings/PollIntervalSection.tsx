/**
 * PollIntervalSection — configure server polling frequency.
 *
 * Compact inline control: "Poll every [N] seconds"
 * The input is sized just wide enough for a two-digit number.
 */

import { INPUT } from "./styles.ts";

export function PollIntervalSection(
  { pollInterval, onChange }: {
    pollInterval: number;
    onChange: (ms: number) => void;
  },
) {
  return (
    <div class="flex items-center gap-2">
      <span class="text-sm font-body text-bark">Check for servers every</span>
      <input
        type="number"
        value={pollInterval / 1000}
        min="1"
        step="1"
        class={`${INPUT} w-14 text-center tabular-nums`}
        onInput={(e) => {
          const seconds = parseFloat(
            (e.target as HTMLInputElement).value,
          ) || 1;
          onChange(Math.max(1000, Math.round(seconds * 1000)));
        }}
      />
      <span class="text-sm font-body text-bark">seconds</span>
    </div>
  );
}
