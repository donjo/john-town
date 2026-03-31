/**
 * ExcludedProcessesSection — manage process name exclusions.
 *
 * Shows existing exclusions as removable pills and an input to add new ones.
 */

import { useRef } from "preact/hooks";
import { ADD_BTN, INPUT } from "./styles.ts";

export function ExcludedProcessesSection(
  { processes, onDelete, onAdd }: {
    processes: string[];
    onDelete: (i: number) => void;
    onAdd: (name: string) => void;
  },
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div class="flex flex-wrap gap-2 mb-4">
        {processes.map((p, i) => (
          <span
            key={`${p}-${i}`}
            class="inline-flex items-center gap-1.5 bg-sand border border-pebble rounded-lg px-3 py-1.5 text-sm font-mono text-charcoal transition-colors duration-150 hover:border-bark"
          >
            {p}
            <button
              type="button"
              class="text-pebble hover:text-charcoal cursor-pointer transition-colors duration-150"
              onClick={() => onDelete(i)}
              aria-label={`Remove ${p}`}
            >
              {"\u2715"}
            </button>
          </span>
        ))}
      </div>
      <div class="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Process name"
          class={INPUT}
        />
        <button
          type="button"
          class={ADD_BTN}
          onClick={() => {
            const name = inputRef.current?.value.trim();
            if (name) {
              onAdd(name);
              if (inputRef.current) inputRef.current.value = "";
            }
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
