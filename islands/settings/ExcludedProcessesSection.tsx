/**
 * ExcludedProcessesSection — manage process name exclusions.
 *
 * Shows existing exclusions as removable pills and an input to add new ones.
 */

import { useRef } from "preact/hooks";

const INPUT =
  "bg-cream border border-pebble rounded px-2 py-1.5 text-sm font-mono text-charcoal transition-colors duration-150 focus:border-meadow focus:outline-none";

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
      <div class="flex flex-wrap gap-2 mb-3">
        {processes.map((p, i) => (
          <span
            key={`${p}-${i}`}
            class="inline-flex items-center gap-1.5 bg-sand border border-pebble rounded-full px-3 py-1 text-xs font-mono text-charcoal transition-colors duration-150 hover:border-bark"
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
          class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading font-semibold transition-colors duration-150"
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
