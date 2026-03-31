/**
 * CharactersSection — edit framework-to-character mappings.
 *
 * Each row shows the framework name (read-only), an emoji picker button,
 * an editable label, and a delete button. An "add" row sits at the bottom.
 */

import { useRef } from "preact/hooks";
import type { Character } from "@/lib/settings.ts";
import { EmojiButton } from "./EmojiPicker.tsx";
import { ADD_BTN, DELETE_BTN_HOVER, FIELD_LABEL, INPUT } from "./styles.ts";

export function CharactersSection(
  { characters, onChange, onDelete }: {
    characters: Record<string, Character>;
    onChange: (fw: string, field: keyof Character, value: string) => void;
    onDelete: (fw: string) => void;
  },
) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* Column labels — mirrors the dashboard table header pattern */}
      <div class="grid grid-cols-[7rem_2.5rem_1fr_2rem] gap-2 mb-2 px-0.5">
        <span class={FIELD_LABEL}>Framework</span>
        <span />
        <span class={FIELD_LABEL}>Character Name</span>
        <span />
      </div>

      <div class="space-y-1.5">
        {Object.keys(characters).map((fw) => {
          const ch = characters[fw];
          return (
            <div
              key={fw}
              class="group grid grid-cols-[7rem_2.5rem_1fr_2rem] gap-2 items-center"
            >
              <span
                class={`${INPUT} bg-sand text-bark truncate`}
                title={fw}
              >
                {fw}
              </span>
              <EmojiButton
                emoji={ch.emoji}
                onChange={(em) => onChange(fw, "emoji", em)}
              />
              <input
                type="text"
                value={ch.label}
                class={INPUT}
                onInput={(e) =>
                  onChange(fw, "label", (e.target as HTMLInputElement).value)}
              />
              <button
                type="button"
                class={DELETE_BTN_HOVER}
                onClick={() => onDelete(fw)}
                aria-label={`Remove ${fw}`}
              >
                {"\u2715"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new townsperson */}
      <div class="flex items-center gap-2 mt-4 pt-3 border-t border-pebble/20">
        <input
          ref={inputRef}
          type="text"
          placeholder="Framework name"
          class={INPUT}
        />
        <button
          type="button"
          class={ADD_BTN}
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
