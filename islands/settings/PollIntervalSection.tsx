/**
 * PollIntervalSection — configure server polling frequency.
 */

const INPUT =
  "bg-cream border border-pebble rounded px-2 py-1.5 text-sm font-mono text-charcoal transition-colors duration-150 focus:border-meadow focus:outline-none";

export function PollIntervalSection(
  { pollInterval, onChange }: {
    pollInterval: number;
    onChange: (ms: number) => void;
  },
) {
  return (
    <div class="flex items-center gap-2">
      <span class="text-sm text-bark">Poll every</span>
      <input
        type="number"
        value={pollInterval / 1000}
        min="1"
        step="1"
        class={`${INPUT} w-16`}
        onInput={(e) => {
          const seconds = parseFloat(
            (e.target as HTMLInputElement).value,
          ) || 1;
          onChange(Math.max(1000, Math.round(seconds * 1000)));
        }}
      />
      <span class="text-sm text-bark">seconds</span>
    </div>
  );
}
