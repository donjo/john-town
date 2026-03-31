/**
 * CharactersSection — edit framework-to-character mappings.
 */

import { useRef } from "preact/hooks";
import type { Character } from "@/lib/settings.ts";
import { EmojiButton } from "./EmojiPicker.tsx";

const IC =
  "bg-cream border border-pebble rounded px-2 py-1 text-sm font-mono text-charcoal focus:border-meadow focus:outline-none";

export function CharactersSection(
  { characters, onChange, onDelete }: {
    characters: Record<string, Character>;
    onChange: (fw: string, field: keyof Character, value: string) => void;
    onDelete: (fw: string) => void;
  },
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div class="pb-3 space-y-2">
      {Object.keys(characters).map((fw) => {
        const ch = characters[fw];
        return (
          <div key={fw} class="flex items-center gap-2">
            <span class={`${IC} w-28 bg-sand`}>{fw}</span>
            <EmojiButton
              emoji={ch.emoji}
              onChange={(em) => onChange(fw, "emoji", em)}
            />
            <input
              type="text"
              value={ch.label}
              class={`${IC} flex-1`}
              onInput={(e) =>
                onChange(fw, "label", (e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              class="text-pebble hover:text-charcoal cursor-pointer px-1"
              onClick={() => onDelete(fw)}
            >
              {"\u2715"}
            </button>
          </div>
        );
      })}
      <div class="flex items-center gap-2 mt-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Framework name"
          class={IC}
        />
        <button
          type="button"
          class="text-sm text-meadow hover:text-meadow-dark cursor-pointer font-heading"
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
