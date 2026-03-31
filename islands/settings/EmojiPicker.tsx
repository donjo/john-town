/**
 * EmojiPicker — categorized emoji selector with positioned popover.
 */

import { useEffect, useRef, useState } from "preact/hooks";

const EMOJI_CATEGORIES: { label: string; icon: string; emoji: string[] }[] = [
  {
    label: "Animals",
    icon: "\uD83D\uDC3E",
    emoji: [
      "\uD83D\uDC31",
      "\uD83D\uDC36",
      "\uD83D\uDC38",
      "\uD83E\uDD89",
      "\uD83E\uDD9D",
      "\uD83D\uDC3B",
      "\uD83D\uDC0D",
      "\uD83E\uDD8A",
      "\uD83D\uDC30",
      "\uD83D\uDC26",
      "\uD83D\uDC3F\uFE0F",
      "\uD83E\uDD9C",
      "\uD83D\uDC2D",
      "\uD83E\uDD94",
      "\uD83E\uDD95",
      "\uD83D\uDC39",
      "\uD83D\uDC22",
      "\uD83D\uDC19",
      "\uD83E\uDD8B",
      "\uD83D\uDC1D",
      "\uD83D\uDC27",
      "\uD83E\uDD81",
      "\uD83D\uDC2F",
      "\uD83D\uDC34",
      "\uD83E\uDD84",
      "\uD83D\uDC3C",
      "\uD83D\uDC28",
      "\uD83E\uDDA5",
      "\uD83E\uDD9B",
      "\uD83E\uDD92",
      "\uD83D\uDC33",
      "\uD83D\uDC2C",
      "\uD83E\uDD88",
      "\uD83E\uDD9E",
      "\uD83D\uDC0A",
      "\uD83E\uDD86",
    ],
  },
  {
    label: "People",
    icon: "\uD83D\uDE4B",
    emoji: [
      "\uD83E\uDDD1\u200D\uD83D\uDD27",
      "\uD83E\uDDD1\u200D\uD83C\uDFA8",
      "\uD83E\uDDD1\u200D\uD83D\uDE80",
      "\uD83E\uDDD1\u200D\uD83C\uDF73",
      "\uD83E\uDDD1\u200D\uD83C\uDF3E",
      "\uD83E\uDDD1\u200D\uD83D\uDCBB",
      "\uD83E\uDDD1\u200D\uD83D\uDD2C",
      "\uD83E\uDDD1\u200D\uD83C\uDFEB",
      "\uD83E\uDDD9",
      "\uD83E\uDDDA",
      "\uD83E\uDDDC",
      "\uD83E\uDDDB",
      "\uD83E\uDDDE",
      "\uD83E\uDDDF",
      "\uD83E\uDDB8",
      "\uD83E\uDDB9",
      "\uD83D\uDC77",
      "\uD83D\uDC68\u200D\uD83C\uDF93",
      "\uD83D\uDC69\u200D\uD83C\uDFED",
      "\uD83E\uDD34",
      "\uD83D\uDC78",
      "\uD83E\uDD77",
      "\uD83E\uDDD1\u200D\uD83C\uDFA4",
      "\uD83E\uDDD1\u200D\u2708\uFE0F",
    ],
  },
  {
    label: "Nature",
    icon: "\uD83C\uDF3F",
    emoji: [
      "\uD83C\uDF33",
      "\uD83C\uDF35",
      "\uD83C\uDF3B",
      "\uD83C\uDF37",
      "\uD83C\uDF3A",
      "\uD83C\uDF38",
      "\uD83C\uDF3C",
      "\uD83C\uDF39",
      "\uD83C\uDF40",
      "\uD83C\uDF3E",
      "\uD83C\uDF44",
      "\uD83E\uDEB5",
      "\u2B50",
      "\uD83C\uDF1F",
      "\u2600\uFE0F",
      "\uD83C\uDF19",
      "\uD83C\uDF08",
      "\u26A1",
      "\uD83D\uDD25",
      "\uD83C\uDF0A",
      "\u2744\uFE0F",
      "\uD83C\uDF3F",
      "\uD83E\uDEB7",
      "\uD83E\uDEB4",
    ],
  },
  {
    label: "Objects",
    icon: "\uD83D\uDEE0\uFE0F",
    emoji: [
      "\uD83D\uDEE0\uFE0F",
      "\uD83D\uDD27",
      "\u2699\uFE0F",
      "\uD83D\uDD2C",
      "\uD83D\uDCE1",
      "\uD83D\uDCA1",
      "\uD83D\uDD2E",
      "\uD83C\uDFA8",
      "\uD83C\uDFB5",
      "\uD83C\uDFAE",
      "\uD83D\uDCDA",
      "\uD83D\uDCDC",
      "\u2709\uFE0F",
      "\uD83D\uDCE6",
      "\uD83C\uDFF0",
      "\uD83C\uDFE0",
      "\uD83D\uDE82",
      "\u26F5",
      "\uD83D\uDE80",
      "\uD83C\uDFAA",
      "\uD83C\uDFA0",
      "\uD83C\uDFAD",
      "\uD83D\uDC8E",
      "\uD83D\uDEA9",
    ],
  },
  {
    label: "Food",
    icon: "\uD83C\uDF54",
    emoji: [
      "\uD83C\uDF4E",
      "\uD83C\uDF4A",
      "\uD83C\uDF4B",
      "\uD83C\uDF49",
      "\uD83C\uDF53",
      "\uD83C\uDF52",
      "\uD83C\uDF51",
      "\uD83E\uDD51",
      "\uD83C\uDF55",
      "\uD83C\uDF54",
      "\uD83C\uDF2E",
      "\uD83C\uDF63",
      "\uD83C\uDF70",
      "\uD83C\uDF69",
      "\uD83C\uDF6A",
      "\uD83C\uDF66",
      "\u2615",
      "\uD83C\uDF75",
      "\uD83E\uDD64",
      "\uD83C\uDF7A",
    ],
  },
];

function EmojiPicker(
  { currentEmoji, onSelect, onClose, anchorRef }: {
    currentEmoji: string;
    onSelect: (emoji: string) => void;
    onClose: () => void;
    anchorRef: { current: HTMLButtonElement | null };
  },
) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);

  // Position the picker above the anchor button using fixed coordinates
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPos({
      left: Math.max(8, rect.left),
      bottom: globalThis.innerHeight - rect.top + 4,
    });
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const category = EMOJI_CATEGORIES[activeCategory];

  if (!pos) return null;

  return (
    <div
      ref={pickerRef}
      class="fixed bg-cream border-2 border-pebble rounded-lg z-[100] w-[280px]"
      style={{
        left: `${pos.left}px`,
        bottom: `${pos.bottom}px`,
        boxShadow:
          "0 -8px 24px rgba(61,54,41,0.12), 0 -2px 8px rgba(61,54,41,0.08)",
      }}
    >
      {/* Category tabs */}
      <div class="flex border-b border-pebble">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            class={`flex-1 py-1.5 text-center text-sm cursor-pointer transition-colors ${
              i === activeCategory
                ? "bg-sand border-b-2 border-meadow -mb-px"
                : "hover:bg-sand/50"
            }`}
            onClick={() => setActiveCategory(i)}
            title={cat.label}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Category label */}
      <div class="px-3 pt-2 pb-1">
        <span class="text-[10px] uppercase tracking-wider text-driftwood font-heading font-semibold">
          {category.label}
        </span>
      </div>

      {/* Emoji grid */}
      <div class="px-2 pb-2 grid grid-cols-8 gap-0.5 max-h-[160px] overflow-y-auto">
        {category.emoji.map((em) => (
          <button
            key={em}
            type="button"
            class={`w-8 h-8 flex items-center justify-center text-lg rounded cursor-pointer transition-all hover:scale-125 hover:bg-sunshine/30 ${
              em === currentEmoji
                ? "bg-sunshine/40 ring-1 ring-sunshine-dark"
                : ""
            }`}
            onClick={() => {
              onSelect(em);
              onClose();
            }}
          >
            {em}
          </button>
        ))}
      </div>

      {/* macOS shortcut hint */}
      <div class="border-t border-pebble px-3 py-1.5 flex items-center gap-1.5 bg-sand/50 rounded-b-lg">
        <span class="text-[10px] text-driftwood">or press</span>
        <kbd class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-cream border border-pebble rounded text-[10px] font-mono text-bark shadow-[0_1px_0_rgba(0,0,0,0.08)]">
          <span class="text-[9px]">&#x2318;</span>
          <span class="text-[9px]">&#x2303;</span>
          Space
        </kbd>
        <span class="text-[10px] text-driftwood">for system picker</span>
      </div>
    </div>
  );
}

export function EmojiButton(
  { emoji, onChange }: {
    emoji: string;
    onChange: (emoji: string) => void;
  },
) {
  const [showPicker, setShowPicker] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        class="w-10 h-8 flex items-center justify-center bg-cream border border-pebble rounded text-lg cursor-pointer transition-all hover:border-meadow hover:scale-110 hover:shadow-sm active:scale-95"
        onClick={() => setShowPicker(!showPicker)}
        title="Pick emoji"
      >
        {emoji}
      </button>
      {showPicker && (
        <EmojiPicker
          currentEmoji={emoji}
          onSelect={onChange}
          onClose={() => setShowPicker(false)}
          anchorRef={btnRef}
        />
      )}
    </>
  );
}
