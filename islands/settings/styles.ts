/**
 * Shared Styles for Settings Components
 *
 * Single source of truth for recurring Tailwind class patterns
 * used across all settings sections. Keeps the visual language
 * consistent and easy to update in one place.
 */

/** Standard text input / number input */
export const INPUT =
  "bg-cream border border-pebble rounded-lg px-3 py-2 text-sm font-body text-charcoal transition-colors duration-150 focus:border-meadow focus:outline-none";

/** The small "x" button used to remove a row — hidden until the row is hovered.
 *  Requires `group` on the parent row. Always visible on mobile (no hover). */
export const DELETE_BTN_HOVER =
  "text-pebble hover:text-charcoal cursor-pointer p-1.5 rounded-lg transition-all duration-150 hover:bg-sand md:opacity-0 md:group-hover:opacity-100";

/** Green "+ Add …" text button at the bottom of each section */
export const ADD_BTN =
  "text-sm text-meadow-dark hover:text-charcoal cursor-pointer font-heading font-semibold transition-colors duration-150";

/** Warm shadow applied to all card-like containers */
export const CARD_SHADOW =
  "0 4px 12px rgba(160,113,79,0.10), 0 1px 3px rgba(160,113,79,0.08)";

/** Small label that sits above a group of inputs (like "Start", "End") */
export const FIELD_LABEL =
  "text-xs font-heading font-semibold uppercase tracking-wider text-driftwood";
