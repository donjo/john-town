/**
 * PortRangesSection — edit scanned port ranges.
 *
 * Each row has start port, end port, a label, and a delete button.
 * Column labels sit above the inputs so it's clear what each field is.
 * An "add" button sits at the bottom.
 */

import type { PortRange } from "@/lib/settings.ts";
import { ADD_BTN, DELETE_BTN_HOVER, FIELD_LABEL, INPUT } from "./styles.ts";

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
    <div>
      {/* Column labels */}
      <div class="grid grid-cols-[5rem_auto_5rem_1fr_2rem] gap-2 mb-2 px-0.5">
        <span class={FIELD_LABEL}>Start</span>
        <span />
        <span class={FIELD_LABEL}>End</span>
        <span class={FIELD_LABEL}>Label</span>
        <span />
      </div>

      <div class="space-y-1.5">
        {portRanges.map((r, i) => (
          <div
            key={i}
            class="group grid grid-cols-[5rem_auto_5rem_1fr_2rem] gap-2 items-center"
          >
            <input
              type="number"
              value={r.start}
              class={INPUT}
              onInput={(e) =>
                onChange(
                  i,
                  "start",
                  parseInt((e.target as HTMLInputElement).value) || 0,
                )}
            />
            <span class="text-pebble text-sm text-center select-none">
              &ndash;
            </span>
            <input
              type="number"
              value={r.end}
              class={INPUT}
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
              class={INPUT}
              onInput={(e) =>
                onChange(i, "label", (e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              class={DELETE_BTN_HOVER}
              onClick={() => onDelete(i)}
              aria-label={`Remove port range ${r.start}-${r.end}`}
            >
              {"\u2715"}
            </button>
          </div>
        ))}
      </div>

      <div class="mt-4 pt-3 border-t border-pebble/20">
        <button
          type="button"
          class={ADD_BTN}
          onClick={onAdd}
        >
          + Add Range
        </button>
      </div>
    </div>
  );
}
