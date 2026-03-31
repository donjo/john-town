/**
 * CharactersSection — edit framework-to-character mappings.
 *
 * Each row shows the framework name (read-only), an emoji picker button,
 * an editable label, and a delete button. An "add" row sits at the bottom.
 */

import { useRef } from "preact/hooks";
import type { Character } from "@/lib/settings.ts";
import { EmojiButton } from "./EmojiPicker.tsx";

const INPUT =
  "bg-cream border border-pebble rounded px-2 py-1.5 text-sm font-mono text-charcoal transition-colors duration-150 focus:border-meadow focus:outline-none";

export function CharactersSection(
  { characters, onChange, onDelete }: {
    characters: Record<string, Character>;
    onChange: (fw: string, field: keyof Character, value: string) => void;
    onDelete: (fw: string) => void;
  },
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div class="space-y-2">
      {Object.keys(characters).map((fw) => {
        const ch = characters[fw];
        return (
          <div key={fw} class="flex items-center gap-2">
            <span class={`${INPUT} w-28 bg-sand text-bark`}>{fw}</span>
            <EmojiButton
              emoji={ch.emoji}
              onChange={(em) => onChange(fw, "emoji", em)}
            />
            <input
              type="text"
              value={ch.label}
              class={`${INPUT} flex-1`}
              onInput={(e) =>
                onChange(fw, "label", (e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              class="text-pebble hover:text-charcoal cursor-pointer p-1 rounded transition-colors duration-150 hover:bg-sand"
              onClick={() => onDelete(fw)}
              aria-label={`Remove ${fw}`}
            >
              {"\u2715"}
            </button>
          </div>
        );
      })}
      <div class="flex items-center gap-2 pt-1">
        <input
          ref={inputRef}
          type="text"
          placeholder="Framework name"
          class={INPUT}
        />
        <button
          type="button"
          class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading font-semibold transition-colors duration-150"
          onClick={() => {
            const name = inputRef.current?.value.trim();
            if (name) {
              onChange(name, "emoji", "\uD83D\uDC39");
              onChange(name, "label", "New Townsperson");
              if (inputRef.current) inputRef.current.value = "";
            }
          }}
        >
          + Add Townsperson
        </button>
      </div>
    </div>
  );
}
