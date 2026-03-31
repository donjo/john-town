/**
 * ExcludedProcessesSection — manage process name exclusions.
 */

import { useRef } from "preact/hooks";

const IC =
  "bg-cream border border-pebble rounded px-2 py-1 text-sm font-mono text-charcoal focus:border-meadow focus:outline-none";

export function ExcludedProcessesSection(
  { processes, onDelete, onAdd }: {
    processes: string[];
    onDelete: (i: number) => void;
    onAdd: (name: string) => void;
  },
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div class="pb-3">
      <div class="flex flex-wrap gap-2 mb-2">
        {processes.map((p, i) => (
          <span
            key={`${p}-${i}`}
            class="inline-flex items-center gap-1 bg-sand border border-pebble rounded-full px-3 py-1 text-xs font-mono text-charcoal"
          >
            {p}
            <button
              type="button"
              class="text-pebble hover:text-charcoal cursor-pointer"
              onClick={() => onDelete(i)}
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
          class={IC}
        />
        <button
          type="button"
          class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading"
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
