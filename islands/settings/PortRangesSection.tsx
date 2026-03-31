/**
 * PortRangesSection — edit scanned port ranges.
 */

import type { PortRange } from "@/lib/settings.ts";

const IC =
  "bg-cream border border-pebble rounded px-2 py-1 text-sm font-mono text-charcoal focus:border-meadow focus:outline-none";

export function PortRangesSection(
  { portRanges, onChange, onDelete, onAdd }: {
    portRanges: PortRange[];
    onChange: (
      i: number,
      field: keyof PortRange,
      value: string | number,
    ) => void;
    onDelete: (i: number) => void;
    onAdd: () => void;
  },
) {
  return (
    <div class="pb-3 space-y-2">
      {portRanges.map((r, i) => (
        <div key={i} class="flex items-center gap-2">
          <input
            type="number"
            value={r.start}
            class={`${IC} w-20`}
            onInput={(e) =>
              onChange(
                i,
                "start",
                parseInt((e.target as HTMLInputElement).value) || 0,
              )}
          />
          <span class="text-pebble text-sm">&ndash;</span>
          <input
            type="number"
            value={r.end}
            class={`${IC} w-20`}
            onInput={(e) =>
              onChange(
                i,
                "end",
                parseInt((e.target as HTMLInputElement).value) || 0,
              )}
          />
          <input
            type="text"
            value={r.label}
            class={`${IC} flex-1`}
            onInput={(e) =>
              onChange(i, "label", (e.target as HTMLInputElement).value)}
          />
          <button
            type="button"
            class="text-pebble hover:text-charcoal cursor-pointer px-1"
            onClick={() => onDelete(i)}
          >
            {"\u2715"}
          </button>
        </div>
      ))}
      <button
        type="button"
        class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading"
        onClick={onAdd}
      >
        + Add Range
      </button>
    </div>
  );
}
