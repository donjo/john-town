/**
 * PortRangesSection — edit scanned port ranges.
 *
 * Each row has start port, end port, a label, and a delete button.
 * An "add" button sits at the bottom.
 */

import type { PortRange } from "@/lib/settings.ts";

const INPUT =
  "bg-cream border border-pebble rounded px-2 py-1.5 text-sm font-mono text-charcoal transition-colors duration-150 focus:border-meadow focus:outline-none";

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
    <div class="space-y-2">
      {portRanges.map((r, i) => (
        <div key={i} class="flex items-center gap-2">
          <input
            type="number"
            value={r.start}
            class={`${INPUT} w-20`}
            onInput={(e) =>
              onChange(
                i,
                "start",
                parseInt((e.target as HTMLInputElement).value) || 0,
              )}
          />
          <span class="text-pebble text-sm select-none">&ndash;</span>
          <input
            type="number"
            value={r.end}
            class={`${INPUT} w-20`}
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
            class={`${INPUT} flex-1`}
            onInput={(e) =>
              onChange(i, "label", (e.target as HTMLInputElement).value)}
          />
          <button
            type="button"
            class="text-pebble hover:text-charcoal cursor-pointer p-1 rounded transition-colors duration-150 hover:bg-sand"
            onClick={() => onDelete(i)}
            aria-label={`Remove port range ${r.start}-${r.end}`}
          >
            {"\u2715"}
          </button>
        </div>
      ))}
      <button
        type="button"
        class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading font-semibold pt-1 transition-colors duration-150"
        onClick={onAdd}
      >
        + Add Range
      </button>
    </div>
  );
}
